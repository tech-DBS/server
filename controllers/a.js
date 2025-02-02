// const { chromium } = require("playwright");
// const fs = require("fs");

// (async () => {
//   const browser = await chromium.launch();
//   const page = await browser.newPage();

//   // Load local HTML file
//   const htmlContent = fs.readFileSync("./html/index.html", "utf8");
//   await page.setContent(htmlContent, { waitUntil: "load" });

//   // Save as PDF
//   await page.pdf({
//     path: "./output/output.pdf",
//     format: "A4",
//     printBackground: true,
//   });

//   await browser.close();
//   console.log("PDF successfully created: output.pdf");
// })();

const htmlToPdf = require("html-to-pdf");

htmlToPdf.convertHTMLFile(
  "./html/index.html",
  "./output/output.pdf",
  function (error, success) {
    if (error) {
      console.log("Oh noes! Errorz!");
      console.log(error);
    } else {
      console.log("Woot! Success!");
      console.log(success);
    }
  }
);
