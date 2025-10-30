const express = require("express");
const puppeteer = require("puppeteer");
const bodyParser = require("body-parser");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json({ limit: "2mb" }));

app.post("/convert", async (req, res) => {
  const { url, html } = req.body;

  if (!url && !html) {
    return res.status(400).json({ error: "Serve un URL o HTML" });
  }

  try {
    const browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });
    const page = await browser.newPage();

    if (url) {
      await page.goto(url, { waitUntil: "networkidle2" });
    } else {
      await page.setContent(html, { waitUntil: "networkidle0" });
    }

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true
    });

    await browser.close();

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": "attachment; filename=converted.pdf"
    });
    res.send(pdfBuffer);
  } catch (err) {
    console.error("Errore:", err);
    res.status(500).json({ error: "Errore nella generazione PDF" });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server attivo su http://localhost:${PORT}`);
});
