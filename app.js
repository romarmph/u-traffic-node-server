const express = require("express");
const firestore = require("./config/index.js");
const payments = require("./functions/payments.js");

const app = express();

app.listen(3000, function () {
  console.log("Server is running on http://localhost:3000");
});
