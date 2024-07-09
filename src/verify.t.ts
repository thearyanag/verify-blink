import Blink from ".";
("");
console.log(
  Blink.verifySignedHash(
    "3b5f2e60618e253c010c04cbbd073c92", // file hash 
    "1720525311333",
    "Rd6RcNpszMU/0xZOmI4xv8E2IDHLocku5Q3/HNluQJYX8rMzgYMvv9ylK2f1K9LzYmyBhg9oV4NcZS7Fe4DQDGEwM2RjODVjNjllOTY3MmMwMDc1NGM2MTI1ZGJmNTYxMzYwYjIzOTU3OGNmOGY2MWY5Njk5MTgwZWU5ZDlkNWE=",
    "aryn2Q6P4SMCD4GcpGSqnoy3TFRvVgwvTgeamRqDkJn"// pulbic key
  )
);
