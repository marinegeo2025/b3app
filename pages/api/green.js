import fs from "fs";
import translations from "../../lib/translations";

export default function handler(req, res) {
  const lang = req.query.lang === "gd" ? "gd" : "en";
  const t = translations[lang];

  const json = JSON.parse(fs.readFileSync("green.json", "utf8"));
  const block = json.results[0];

  if (!block) {
    return res.status(500).send(`<p>${t.noData}</p>`);
  }

  res.send(`
  <html>
  <head>
    <title>${t.greenTitle}</title>
    <link rel="stylesheet" href="/style.css">
  </head>
  <body class="green-page">
    <div class="container">
      <h1>${t.greenTitle}</h1>
      <h2>${block.area}</h2>
      <ul>
        ${block.dates.map(d => `<li>${d}</li>`).join("")}
      </ul>
      <a href="/?lang=${lang}">${t.back}</a>
    </div>
  </body>
  </html>
  `);
}
