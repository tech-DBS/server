const { validationResult } = require("express-validator");

// file
const fs = require("fs");
const path = require("path");

// Sheets
const { google } = require("googleapis");

// axios
const axios = require("axios");

const auth = new google.auth.GoogleAuth({
  keyFile: "./google.json",
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

const genLetter = async (req, res, next) => {
  try {
    const data = await readSheet();

    const PRFCO_API_KEY = process.env.PRFCO_API_KEY;

    const SourceFileUrl =
      "https://cloud.appwrite.io/v1/storage/buckets/679e8e45003cb356bbaa/files/679e8e7c003a8201ecee/view?project=679e8e0a0036c08d4ca7&mode=admin";

    const Password = "";
    const DestinationFile = "./result.pdf";

    const apiUrl = "https://api.pdf.co/v1/pdf/edit/replace-text";

    const requestData = {
      name: path.basename(DestinationFile),
      password: Password,
      url: SourceFileUrl,
      searchString: "Your Company Name",
      replaceString: "XYZ LLC",
    };

    // Make API request to replace text in the PDF
    const response = await axios.post(apiUrl, requestData, {
      headers: {
        "x-api-key": PRFCO_API_KEY,
        "Content-Type": "application/json",
      },
    });

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

// Asynchronous function to read data from a Google Sheet.
async function readSheet() {
  const sheets = google.sheets({ version: "v4", auth });
  const spreadsheetId = "1sbsjAjsR9zPAybDascnUda3U4IXmGeSfZ4ytGaFfm_g";
  const range = "Job!A1:E10"; // Specifies the range to read.

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    const rows = response.data.values;

    return rows;
  } catch (error) {
    console.error("error", error); // Logs errors.
  }
}

exports.genLetter = genLetter;
