require("dotenv").config();
const express = require("express");
const app = express();
const PORT = process.env.DATA_SENDER_PORT;
const generateRandomCaptainsLog = require("./generateRandomCaptainsLog.js");

app.use(express.json());

//get endpoint that returnes typical data that a captain needs to write down every 5 minutes.

app.get("/", async (req, res) => {
  res.send(generateRandomCaptainsLog());
});

app.listen(PORT, () => {
  console.log("ship-data-sender running on port ", PORT);
});
