const express = require("express");
const cors = require("cors");
const admin = require("./config/index.js");
const enforcerRouter = require("./routes/enforcer.js");

const app = express();

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(enforcerRouter);

app.listen(3000, function () {
  console.log("Server is running on http://localhost:3000");
});
