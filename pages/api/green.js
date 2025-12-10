// pages/api/green.js
import fs from "fs";
import path from "path";
import translations from "../../lib/translations.js";

export default async function handler(req, res) {
  const lang = req.query.lang === "gd" ? "gd" : "en";
  const t = translations[lang];

  try {
    const filePath = path.join(process.cwd(), "brue", "green.json");
    if (!fs.existsSync(filePath)) {
      return res.status(500).send(`<p>⚠️ ${t.noData}</p>`);
    }

    const json = JSON.parse(fs.readFileSync(filePath, "utf8"));
    const brueBlock = json.results.find((r) => /brue/i.test(r.area));

    if (!brueBlock) {
      return res.status(500).send(`<p>${t.noData}</p>`);
    }

    const lastUpdated = new Date(json.lastUpdated).toLocaleString("en-GB", {
      timeZone: "Europe/London",
    });

    // Render HTML
    res.setHeader("Content-Type", "text/html");
    res.status(200).send(`<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8">
  <title>${t.greenTitle}</title>
  <link rel="stylesheet" href="/style.css">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
</head>
<body class="green-page">
  <div class="container">
    <h1><i class="fas fa-wine-bottle"></i> ${t.greenTitle} – Brue</h1>
    <h2>${brueBlock.area}</h2>
    <p><em>${brueBlock.locations.join(", ")}</em></p>
    <ul>
      ${brueBlock.dates
        .map(
          (d) => `<li><i class="fas fa-calendar-day"></i> ${d}</li>`
        )
        .join("")}
    </ul>
    <p class="last-updated"><em>${t.lastUpdated || "Last updated"}: ${lastUpdated}</em></p>
    <a class="back" href="/?lang=${lang}">← ${lang === "gd" ? "Air ais" : "Back"}</a>
  </div>
</body>
</html>`);
  } catch (err) {
    console.error("Green bin render error:", err);
    res.status(500).send(`<p>${t.errorFetching} ${err.message}</p>`);
  }
}
