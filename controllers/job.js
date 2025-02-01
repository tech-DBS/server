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

    const PRFCO_API_KEY =
      "rishavrajcrj@gmail.com_LrhvH1fRQUgJ2ilLI4OC4xqKuIg1kQJNR3ovs2iLvcVIk3zkfEyMwbrMAMXzGTWL";

    const SourceFileUrl =
      "https://bytescout-com.s3-us-west-2.amazonaws.com/files/demo-files/cloud-api/pdf-to-text/sample.pdf";

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

    // Download the generated PDF
    const fileResponse = await axios({
      method: "get",
      url: response.data.url,
      responseType: "stream",
    });

    console.log(response.data.url);

    // Save the file
    const writer = fs.createWriteStream(DestinationFile);
    fileResponse.data.pipe(writer);

    writer.on("finish", () => {
      console.log(`Generated PDF saved as "${DestinationFile}"`);
      return res
        .status(202)
        .json({ message: "PDF generated successfully", file: DestinationFile });
    });

    writer.on("error", (err) => {
      console.error("Error writing file:", err);
      return res.status(500).json({ error: "Failed to save PDF" });
    });
  } catch (error) {
    console.error("Error generating PDF:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.genLetter = genLetter;
