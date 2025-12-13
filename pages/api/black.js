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
    timeZone: "Europe/London"
  });

  res.send(`
    <html>
    <head>
      <title>${t.blackTitle}</title>
      <link rel="stylesheet" href="/style.css">
    </head>
    <body class="black-page">
      <div class="container">
        <h1>${t.blackTitle}</h1>
        <ul>
          ${json.dates.map(d => `<li>${d}</li>`).join("")}
        </ul>
        <p class="last-updated">${lastUpdated}</p>
        <a href="/?lang=${lang}">${t.back}</a>
      </div>
    </body>
    </html>
  `);
}
