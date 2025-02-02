const puppeteer = require("puppeteer");

const fs = require("fs");

async function convertHtmlToPdf(htmlFilePath, outputPdfPath) {
  try {
    // Read the HTML file
    let htmlContent = fs.readFileSync(htmlFilePath, "utf8");

    htmlContent = htmlContent
      .replaceAll("{{name}}", `Rishva Singh`)
      .replaceAll("{{position}}", `Analyst`)
      .replaceAll("{{date}}", `2/02/2025`);

    // Launch Puppeteer
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Set the page content
    await page.setContent(htmlContent, { waitUntil: "load" });

    // Generate PDF
    await page.pdf({
      path: outputPdfPath,
      format: "A4",
      printBackground: true,
    });

    console.log(`✅ PDF created: ${outputPdfPath}`);

    // Close browser
    await browser.close();
  } catch (error) {
    console.error("❌ Error generating PDF:", error);
  }
}

// Example Usage
convertHtmlToPdf("./controllers/index.html", "./controllers/result.pdf");
