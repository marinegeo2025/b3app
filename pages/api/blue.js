import fs from "fs";
import path from "path";
import translations from "../../lib/translations";

export default function handler(req, res) {
  const lang = req.query.lang === "gd" ? "gd" : "en";
  const t = translations[lang];

  const filePath = path.join(process.cwd(), "blue.json");

  if (!fs.existsSync(filePath)) {
    return res.status(500).send(`<p>${t.noData}</p>`);
  }

  const json = JSON.parse(fs.readFileSync(filePath, "utf8"));
  const results = json.results?.slice(0, 1) || [];

  if (!results.length) {
    return res.status(500).send(`<p>${t.noData}</p>`);
  }

  const lastUpdated = new Date(json.lastUpdated).toLocaleString("en-GB", {
    timeZone: "Europe/London",
  });

  res.setHeader("Content-Type", "text/html");
  res.send(`
<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8">
  <title>${t.blueTitle}</title>
  <link rel="stylesheet" href="/style.css">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body class="blue-page">
  <div class="container">
    <h1><i class="fas fa-recycle"></i> ${t.blueTitle}</h1>

    ${results
      .map(
        (block) => `
        <h2>${block.area}</h2>
        <ul>
          ${
            block.dates && block.dates.length
              ? block.dates
                  .map(
                    (d) =>
                      `<li><i class="fas fa-calendar-day"></i> ${d}</li>`
                  )
                  .join("")
              : `<li>${t.noData}</li>`
          }
        </ul>
      `
      )
      .join("")}

    <p class="last-updated"><em>LAST UPDATED: ${lastUpdated}</em></p>
    <a class="back" href="/?lang=${lang}">${t.back}</a>
  </div>
</body>
</html>
  `);
}
