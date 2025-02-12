const pdf = require("html-pdf");
const fs = require("fs");

const htmlPath = "./html/Freelence Associate.html";
const outputPath = "./output/output11.pdf";

// Read the HTML file
fs.readFile(htmlPath, "utf8", (err, html) => {
  if (err) {
    console.error("Error reading HTML file:", err);
    return;
  }

  // Convert HTML to PDF
  pdf.create(html).toFile(outputPath, (err, res) => {
    if (err) {
      console.error("Error generating PDF:", err);
    } else {
      console.log("PDF generated successfully:", res.filename);
    }
  });
});
