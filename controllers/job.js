const { validationResult } = require("express-validator");

// file
const fs = require("fs");
const path = require("path");

// csv
const { parse } = require("json2csv");

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
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { SourceFileUrl } = req.body,
      Password = "",
      data = await readSheet(),
      apiUrl = process.env.API_URL,
      DestinationFile = "./result.pdf",
      PRFCO_API_KEY = process.env.PRFCO_API_KEY,
      options = {
        timeZone: "Asia/Kolkata",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      },
      currentDateIST = new Date().toLocaleDateString("en-IN", options);

    if (data.length === 0) {
      return res.status(204).json({
        status: false,
        message: "Unable to fetch data from sheet",
      });
    }

    let pdfUrls = [];
    for (let i = 1; i < data.length; i++) {
      const [name, position] = data[i];

      // const requestData = {
      //   name: path.basename(DestinationFile),
      //   password: Password,
      //   url: SourceFileUrl,
      //   searchStrings: ["{{name}}", "{{position}}", "{{date}}"],
      //   replaceStrings: [name, position, currentDateIST],
      // };

      // const response = await axios.post(apiUrl, requestData, {
      //   headers: {
      //     "x-api-key": PRFCO_API_KEY,
      //     "Content-Type": "application/json",
      //   },
      // });

      // if (response.data.error) {
      //   console.log("Error from API:", response.data.message);

      //   return res.status(500).json({ error: response.data.message });
      // }

      let localData = {
        name,
        position,
        currentDateIST,
        URL: `i= ${i}`,
        // URL: response.data.url || ``,
      };

      pdfUrls.push(localData);
    }

    const csv = parse(pdfUrls);

    const filePath = path.join(__dirname, "./../CSV/pdf_data.csv");

    fs.writeFileSync(filePath, csv, "utf8");

    console.log("CSV file saved successfully:", filePath);

    return res.status(202).json({
      status: true,
      message: "Data Generated",
      pdfUrls,
    });
  } catch (error) {
    console.error("Error generating PDF:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

async function readSheet() {
  const sheets = google.sheets({ version: "v4", auth });
  const spreadsheetId = "1sbsjAjsR9zPAybDascnUda3U4IXmGeSfZ4ytGaFfm_g";
  const range = "Job!A1:E10";

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    const rows = response.data.values;

    return rows;
  } catch (error) {
    console.error("error", error);
  }
}

exports.genLetter = genLetter;
