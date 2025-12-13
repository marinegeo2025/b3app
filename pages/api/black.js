import fs from "fs";
import path from "path";
import translations from "../../lib/translations";

export default function handler(req, res) {
  const lang = req.query.lang === "gd" ? "gd" : "en";
  const t = translations[lang];

  const filePath = path.join(process.cwd(), "black.json");
  if (!fs.existsSync(filePath)) {
    return res.status(500).send(`<p>${t.noData}</p>`);
  }

  const json = JSON.parse(fs.readFileSync(filePath, "utf8"));
  const lastUpdated = new Date(json.lastUpdated).toLocaleString("en-GB", {
    timeZone: "Europe/London",
  });

  res.setHeader("Content-Type", "text/html");
  res.send(`
<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8">
  <title>${t.blackTitle}</title>
  <link rel="stylesheet" href="/style.css">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body class="black-page">
  <div class="container">
    <h1><i class="fas fa-dumpster"></i> ${t.blackTitle}</h1>

    <ul>
      ${json.dates.map(d =>
        `<li><i class="fas fa-calendar-day"></i> ${d}</li>`
      ).join("")}
    </ul>

    <p class="last-updated"><em>LAST UPDATED: ${lastUpdated}</em></p>
    <a class="back" href="/?lang=${lang}">${t.back}</a>
  </div>
</body>
</html>
  `);
}
