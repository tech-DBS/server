const { validationResult } = require("express-validator");

// file
const fs = require("fs");
const path = require("path");

// axios
const axios = require("axios");

const genLetter = async (req, res, next) => {
  try {
    const name = req.params.name;
    const job = req.params.job;

    console.log(name, job);

    if (!name || !job) {
      return res.status(400).json({ error: "Name and job are required!" });
    }

    // const PRFCO_API_KEY = process.env.PRFCO_API_KEY;

    // const SourceFileUrl =
    //   "https://bytescout-com.s3-us-west-2.amazonaws.com/files/demo-files/cloud-api/pdf-to-text/sample.pdf";

    // const Password = "";
    // const DestinationFile = "./result.pdf";

    // const apiUrl = "https://api.pdf.co/v1/pdf/edit/replace-text";

    // const requestData = {
    //   name: path.basename(DestinationFile),
    //   password: Password,
    //   url: SourceFileUrl,
    //   searchString: "Your Company Name",
    //   replaceString: "XYZ LLC",
    // };

    // Make API request to replace text in the PDF
    // const response = await axios.post(apiUrl, requestData, {
    //   headers: {
    //     "x-api-key": PRFCO_API_KEY,
    //     "Content-Type": "application/json",
    //   },
    // });

    if (response.data.error) {
      console.log("Error from API:", response.data.message);
      return res.status(500).json({ error: response.data.message });
    }

    if (response.data.url) {
      return res.status(202).json({
        status: true,
        message: "Data Generated",
        URL: response.data.url,
      });
    } else {
      return res.status(202).json({
        status: false,
        message: "Unable to Generate",
        URL: response.data.url,
      });
    }
  } catch (error) {
    console.error("Error generating PDF:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.genLetter = genLetter;
