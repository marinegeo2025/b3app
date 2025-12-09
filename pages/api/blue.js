import axios from "axios";
import * as cheerio from "cheerio";
import translations from "../../lib/translations";
import { validateBinTable } from "../../lib/failsafe";

const URL =
  "https://www.cne-siar.gov.uk/bins-and-recycling/waste-recycling-collections-lewis-and-harris/organic-food-and-garden-waste-and-mixed-recycling-blue-bin/thursday-collections";

export default async function handler(req, res) {
  const lang = req.query.lang === "en" ? "en" : "gd";
  const t = translations[lang];

  try {
    // 🧭 Fetch page
    const response = await axios.get(URL, {
      headers: { "User-Agent": "Mozilla/5.0" },
      timeout: 10000,
    });
    const $ = cheerio.load(response.data);

    // 🧩 Fail-safe checks for both Brue & Barvas rows
    try {
      validateBinTable($, { expectedMonths: [], requiredKeyword: "Brue" });
      validateBinTable($, { expectedMonths: [], requiredKeyword: "Barvas" });
    } catch (err) {
      return res.status(500).send(`<p>⚠️ Structure changed: ${err.message}</p>`);
    }

    // 🧱 Extract month headers
    const headers = [];
    $("thead th").each((_, th) => headers.push($(th).text().trim()));
    if (headers.length === 0) {
      $("tr")
        .first()
        .find("th,td")
        .each((_, cell) => headers.push($(cell).text().trim()));
    }
    const months = headers.slice(1);

    // 🧹 Find combined Brue+Barvas rows
    let cells = [];
    $("tr").each((_, row) => {
      const tds = $(row).find("td");
      if (
        tds.length &&
        ($(tds[0]).text().includes("Brue") ||
          $(tds[0]).text().includes("Barvas"))
      ) {
        const rowCells = tds
          .slice(1)
          .map((_, td) => $(td).text().trim())
          .get();
        if (cells.length === 0) {
          cells = rowCells;
        } else {
          // merge duplicate rows
          cells = cells.map((c, i) =>
            [c, rowCells[i]].filter(Boolean).join(", ")
          );
        }
      }
    });

    // 🗓️ Build content
    let content = "";
    if (cells.length) {
      const now = new Date();
      const currentMonth = now.getMonth(); // 0–11
      const currentYear = now.getFullYear();

      const sections = months.map((month, i) => {
        let label = month;
        if (currentMonth === 11 && /^(January|February|March)$/i.test(month)) {
          label = `${month} ${currentYear + 1}`; // December scrape -> next year label
        }

        const dates = cells[i]
          .split(",")
          .map((d) => d.trim())
          .filter(Boolean);

        const lis =
          dates.length > 0
            ? dates
                .map(
                  (d) => `<li><i class="fas fa-calendar-day"></i> ${d}</li>`
                )
                .join("")
            : "<li>-</li>";

        return `<h2>${label}</h2><ul>${lis}</ul>`;
      });

      content = sections.join("");
    } else {
      content = `<p>${t.noData}</p>`;
    }

    // 🎨 Send pretty HTML
    res.setHeader("Content-Type", "text/html");
    res.send(`<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="utf-8">
  <title>${t.blueTitle}</title>
  <link rel="stylesheet" href="/style.css">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
</head>
<body class="blue-page">
  <div class="container">
    <h1><i class="fas fa-recycle"></i> ${t.blueTitle}</h1>
    ${content}
    <a class="back" href="/?lang=${lang}">${t.back}</a>
  </div>
</body>
</html>`);
  } catch (err) {
    res.status(500).send(`<p>${t.errorFetching} ${err.message}</p>`);
  }
}
