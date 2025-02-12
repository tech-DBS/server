const { validationResult } = require("express-validator");

// file
const fs = require("fs");
const path = require("path");
const pdf = require("html-pdf");

// aws
const sdk = require("node-appwrite");
const { Client, Storage, ID, Permission, Role } = require("node-appwrite");
const { InputFile } = require("node-appwrite/file");

// csv
const { parse } = require("json2csv");

// Sheets
const { google } = require("googleapis");

// nodemailer
const nodemailer = require("nodemailer");

const auth = new google.auth.GoogleAuth({
  credentials: {
    type: process.env.GOOGLE_TYPE,
    project_id: process.env.GOOGLE_PROJECT_ID,
    private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    client_id: process.env.GOOGLE_CLIENT_ID,
    auth_uri: process.env.GOOGLE_AUTH_URI,
    token_uri: process.env.GOOGLE_TOKEN_URI,
    auth_provider_x509_cert_url: process.env.GOOGLE_AUTH_PROVIDER_CERT_URL,
    client_x509_cert_url: process.env.GOOGLE_CLIENT_CERT_URL,
  },
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

const client = new Client()
  .setEndpoint("https://cloud.appwrite.io/v1")
  .setProject(process.env.PROJECT_ID)
  .setKey(process.env.SECRET_KEY);

const storage = new Storage(client);

const genLetter = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const JobName = req.params.JobName;

    console.log(JobName);

    const existsPath = path.join(__dirname, `./../html/${JobName}.html`);

    console.log(existsPath);

    // Check if the file exists
    if (!fs.existsSync(existsPath)) {
      return res.status(404).json({ state: false, message: "File not found" });
    }

    const data = await readSheet(),
      options = {
        timeZone: "Asia/Kolkata",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      },
      currentDateIST = new Date().toLocaleDateString("en-IN", options);

    if (data.length === 0) {
      return res.status(204).json({
        state: false,
        message: "Unable to fetch data from sheet",
      });
    }

    let pdfUrls = [];
    for (let i = 1; i < data.length; i++) {
      const [name, position] = data[i];

      let pdfURL = await convertHtmlToPdf(
        `./html/${JobName}.html`,
        `./output/result.pdf`,
        name,
        position,
        currentDateIST
      );

      let localData = {
        name,
        position,
        currentDateIST,
        URL: pdfURL || ``,
      };

      console.log(localData);

      pdfUrls.push(localData);
    }

    const csv = parse(pdfUrls);

    const filePath = path.join(__dirname, "./../CSV/pdf_data.csv");
    fs.writeFileSync(filePath, csv, "utf8");

    console.log("CSV file saved successfully: \t", filePath);

    let fileID = await uploadFile(filePath, "pdf", "csv", "csv");
    let fileURL = await getFile(fileID);

    mainSend(currentDateIST, fileURL, data.length);

    console.log("-----------------");

    return res.status(202).json({
      state: true,
      message: "Data Generated",
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

async function mainSend(currentDateIST, filePath, numOfferLetter) {
  const mailTransport = nodemailer.createTransport({
    host: "smtpout.secureserver.net",
    secure: true,
    secureConnection: true,
    tls: {
      ciphers: "SSLv3",
    },
    requireTLS: true,
    port: 465,
    debug: true,
    auth: {
      user: process.env.EMAIL_ID,
      pass: process.env.PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_ID,
    to: process.env.EMAIL_ID,
    subject: `Internal Offer Letters || ${currentDateIST}`,
    text: `Hi Team, 

Please find attached the offer letters of ${numOfferLetter} candidate(s) as requested. If you need any further information or have any questions, please feel free to reach out.

Best Regards,
Tech Digits B&S`,
    attachments: {
      filename: `Digits_B&S_offer_letter.csv`,
      path: filePath,
    },
  };

  mailTransport
    .sendMail(mailOptions)
    .then(() => {
      console.log("Email sent successfully");
    })
    .catch((err) => {
      console.log("Failed to send email");
      console.error(err);
    });
}

const uploadFile = async (filePath, name, position, ext) => {
  try {
    if (!fs.existsSync(filePath)) {
      throw new Error("File does not exist: " + filePath);
    }

    const resultUpload = await storage.createFile(
      process.env.BUCKET_ID,
      ID.unique(),
      InputFile.fromPath(filePath, `${name}_${position}.${ext}`),
      [
        Permission.read(Role.any()),
        Permission.update(Role.users()),
        Permission.delete(Role.users()),
      ]
    );

    return resultUpload["$id"];
  } catch (error) {
    console.error("Error uploading file:", error);
  }
};

async function getFile(fileId) {
  try {
    const fileURL = `https://cloud.appwrite.io/v1/storage/buckets/${process.env.BUCKET_ID}/files/${fileId}/view?project=${process.env.PROJECT_ID}`;

    return fileURL;
  } catch (error) {
    console.error("Error uploading file:", error);
  }
}

async function convertHtmlToPdf(
  htmlFilePath,
  outputPdfPath,
  name,
  position,
  currentDateIST
) {
  try {
    // Read the HTML file
    let htmlContent = fs.readFileSync(htmlFilePath, "utf8");

    htmlContent = htmlContent
      .replaceAll("{{name}}", name)
      .replaceAll("{{position}}", position)
      .replaceAll("{{date}}", currentDateIST);

    // Convert HTML to PDF
    pdf.create(htmlContent).toFile(outputPdfPath, (err, res) => {
      if (err) {
        console.error("Error generating PDF:", err);
      } else {
        console.log("PDF generated successfully:", res.filename);
      }
    });

    let fileID = await uploadFile(outputPdfPath, name, position, "pdf");
    let fileURL = await getFile(fileID);

    if (fileURL) {
      return fileURL;
    } else {
      return "";
    }
  } catch (error) {
    console.error("❌ Error generating PDF:", error);
  }
}

exports.genLetter = genLetter;
