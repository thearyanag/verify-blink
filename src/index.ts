import * as fs from "fs";
import * as crypto from "crypto";
import * as path from "path";
import * as nacl from "tweetnacl";
import bs58 from "bs58";

interface TimestampedHash {
  time: number;
  hash: string;
}

// Add this type declaration at the top of your file
declare global {
  interface ErrorConstructor {
    prepareStackTrace?: (err: Error, stackTraces: NodeJS.CallSite[]) => any;
    captureStackTrace(targetObject: object, constructorOpt?: Function): void;
  }
}

class Blink {
  private static trackedFiles: Map<string, string> = new Map();

  public static track(filePath?: string): void {
    const targetPath = filePath || Blink.getCallerFilePath();
    if (!targetPath) {
      console.error("Unable to determine the file path");
      return;
    }

    const hash = Blink.getTimestampedFileHash(targetPath);
    Blink.trackedFiles.set(targetPath, hash.hash);
    // console.log(`Now tracking: ${targetPath}`);
  }

  private static getCallerFilePath(): string | null {
    const originalPrepareStackTrace = Error.prepareStackTrace;
    Error.prepareStackTrace = (_, stack) => stack;
    const err = new Error();
    Error.captureStackTrace(err, Blink.track);
    const stack = err.stack as unknown as NodeJS.CallSite[];
    Error.prepareStackTrace = originalPrepareStackTrace;

    if (!stack || stack.length < 2) return null;

    const callerFile = stack[1].getFileName();
    return callerFile ? path.resolve(callerFile) : null;
  }

  private static getTimestampedFileHash(filePath: string): TimestampedHash {
    // console.log(`Hashing: ${filePath}`);
    const fileBuffer = fs.readFileSync(filePath);
    const hashSum = crypto.createHash("md5");
    hashSum.update(fileBuffer);
    const fileHash = hashSum.digest("hex");
    // console.log(`File Hash: ${fileHash}`);

    const timestamp = Date.now();

    // Create a combined hash of the file hash and timestamp
    const combinedHashSum = crypto.createHash("sha256");
    combinedHashSum.update(`${fileHash}:${timestamp}`);
    const combinedHash = combinedHashSum.digest("hex");

    console.log({
      file: filePath,
      fileHash: fileHash,
      time: timestamp,
      hash: combinedHash,
    });

    return {
      time: timestamp,
      hash: combinedHash,
    };
  }

  public static getSignedHash(filePath: string): any {
    const private_key = process.env.BLINK_PRIVATE_KEY;
    if (!private_key) {
      throw new Error("No private key found");
    }
    let { hash, time } = Blink.getTimestampedFileHash(filePath);
    let hashArray = new TextEncoder().encode(hash);
    let signedMsg = nacl.sign(hashArray, bs58.decode(private_key));
    return {
      signedHash: Buffer.from(signedMsg).toString("base64"),
      time: time,
    };
  }

  public static verifySignedHash(
    fileHash: string,
    time: string,
    signedHash: string,
    publicKey: string
  ): boolean {
    const combinedHashSum = crypto.createHash("sha256");
    combinedHashSum.update(`${fileHash}:${time}`);
    const combinedHash = combinedHashSum.digest("hex");
    let hashArray = new TextEncoder().encode(combinedHash);
    let signature = Buffer.from(signedHash, "base64");
    let publicKeyArray = bs58.decode(publicKey);
    return nacl.sign.open(signature, publicKeyArray)?.toString() === hashArray.toString();
  }

  public static checkForChanges(): void {
    for (const [filePath, originalHash] of Blink.trackedFiles) {
      const currentHash = Blink.getTimestampedFileHash(filePath).hash;
      if (currentHash !== originalHash) {
        Blink.trackedFiles.set(filePath, currentHash);
      }
    }
  }

  public static monitor(interval: number = 5000): void {
    setInterval(() => {
      Blink.checkForChanges();
    }, interval);
  }
}

export default Blink;
