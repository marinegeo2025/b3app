import fs from "fs";
import path from "path";
import translations from "../../lib/translations.js";

export default async function handler(req, res) {
  const lang = req.query.lang === "en" ? "en" : "gd";
  const t = translations[lang];

  try {
    const filePath = path.join(process.cwd(), "thursday.json");
    if (!fs.existsSync(filePath)) {
      return res.status(500).send(`
        <p>⚠️ ${t.errorFetching || "Bin data not available yet."}<br/>
        Please check back later.</p>
      `);
    }

    const json = JSON.parse(fs.readFileSync(filePath, "utf8"));
    const block = json.results[0]; // Only one: Brue & Barvas

    if (!block) {
      return res.status(500).send(`<p>${t.noData || "No data found."}</p>`);
    }

    // 🗓️ Group dates by month (with year rollover)
    const monthGroups = {};
    const currentDate = new Date(json.lastUpdated);
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();

    block.dates.forEach((fullDate) => {
      const match = fullDate.match(/^([A-Za-z]+)\s+(\d+\w*)(.*)$/);
      if (match) {
        const [, month, day, note] = match;
        let year = currentYear;
        if (currentMonth === 11 && /^(January|February|March)$/i.test(month)) {
          year = currentYear + 1;
        }
        const monthLabel =
          currentMonth === 11 && /^(January|February|March)$/i.test(month)
            ? `${month} ${year}`
            : month;

        if (!monthGroups[monthLabel]) monthGroups[monthLabel] = [];
        monthGroups[monthLabel].push(`${day}${note ? " " + note.trim() : ""}`);
      }
    });

    const lastUpdated = new Date(json.lastUpdated).toLocaleString("en-GB", {
      timeZone: "Europe/London",
    });

    // 🎨 Render HTML
    res.setHeader("Content-Type", "text/html");
    res.send(`
      <!DOCTYPE html>
      <html lang="${lang}">
      <head>
        <meta charset="UTF-8">
        <title>${t.blueTitle}</title>
        <link rel="stylesheet" href="/style.css">
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
      </head>
      <body class="blue-page">
        <div class="container">
          <h1><i class="fas fa-recycle"></i> ${t.blueTitle}</h1>
          <h2>${block.area}</h2>
          ${Object.entries(monthGroups)
            .map(
              ([month, days]) => `
                <h3>${month}</h3>
                <ul>
                  ${days
                    .map(
                      (d) =>
                        `<li><i class="fas fa-calendar-day"></i> ${d}</li>`
                    )
                    .join("")}
                </ul>`
            )
            .join("")}
          <p class="last-updated"><i>Last updated: ${lastUpdated}</i></p>
        </div>
      </body>
      </html>
    `);
  } catch (err) {
    console.error("Blue Bin JSON parse error:", err);
    res.status(500).send(`<p>${t.errorFetching || "Error:"} ${err.message}</p>`);
  }
}
