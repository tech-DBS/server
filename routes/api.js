const express = require("express");
const router = express.Router();

const { check } = require("express-validator");

// controllers
const job = require("./../controllers/job");

// Test Route
router.get("/", (req, res) => {
  res.status(202).send("HEXBIT.IO -> API Home");
});

router.get("/generate/:name/:job", job.genLetter);

// Route not found
router.use((req, res, next) => {
  console.log("HEXBIT.IO -> URL not Found || Requested URL -  " + req.url);

  return res.status(404).send("404 not found");
});

module.exports = router;
