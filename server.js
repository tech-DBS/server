const express = require("express");
const bodyParser = require("body-parser");

// env
const dotenv = require("dotenv");

dotenv.config();

const app = express();

app.use(bodyParser.json());

// cros
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  // res.setHeader("Access-Control-Allow-Origin", "http://localhost:5173");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );

  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PATCH, DELETE, OPTIONS"
  );

  next();
});

app.get("/BPO", (req, res) => {
  res.send(`Hello World 🚀`);
});

// route
app.use("/api", require("./routes/api"));

// error route
app.get("*", (req, res) => {
  console.log("HEXBIT.IO -> URL not Found || Requested URL -  " + req.url);

  res.send(`404 not found`);
});

const port = process.env.PORT || 5000;

// listen
app.listen(port, () => {
  console.log("HEXBIT.IO -> Server is listining on port " + port);
});
