import Blink from ".";
import http from "http";

// this will take filename from the config.blink
Blink.track(__filename);

// not compulsary - this can be anywhere
Blink.monitor();

const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(
    JSON.stringify({
      verify: Blink.getSignedHash(__filename),
      maltx: "AQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAEDqdCaAzC0s57kHRMlCY1M5XkaGDUdQcA5M3vNxjoEvIEIrK2S8Lt24v9jtZOz0/YP2T6sSPt/q8LYHRE3QzYFcwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAbDxjJjFcJ0mzhvF9dgI9hNZELh6Ru98D95/LjtmhXFoBAgIAAQwCAAAAECcAAAAAAAA=",
    })
  );
});

const port = 3000;
server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});

console.log("Goodbye, World!");
