import fs from "fs";
import translations from "../../lib/translations";

function groupByMonth(dates) {
  const out = {};
  dates.forEach((d) => {
    const [month] = d.split(" ");
    out[month] = out[month] || [];
    out[month].push(d);
  });
  return Object.entries(out);
}

export default function handler(req, res) {
  const lang = req.query.lang === "gd" ? "gd" : "en";
  const t = translations[lang];

  const json = JSON.parse(fs.readFileSync("blue.json", "utf8"));
  const block = json.results.find((r) => /brue|barvas/i.test(r.area));

  if (!block) {
    return res.status(500).send(`<p>${t.noData}</p>`);
  }

  res.send(`
  <html>
  <head>
    <title>${t.blueTitle}</title>
    <link rel="stylesheet" href="/style.css">
  </head>
  <body class="blue-page">
    <div class="container">
      <h1>${t.blueTitle}</h1>
      ${groupByMonth(block.dates)
        .map(
          ([m, ds]) =>
            `<h2>${m}</h2><ul>${ds.map(d => `<li>${d}</li>`).join("")}</ul>`
        )
        .join("")}
      <a href="/?lang=${lang}">${t.back}</a>
    </div>
  </body>
  </html>
  `);
}
