import fs from "fs";
import path from "path";

// Helper: group date strings by month
function groupByMonth(dates) {
  const groups = {};
  dates.forEach((d) => {
    const [month] = d.split(" ");
    groups[month] = groups[month] || [];
    groups[month].push(d);
  });
  return Object.entries(groups);
}

export default async function handler(req, res) {
  try {
    const filePath = path.join(process.cwd(), "thursday.json");

    if (!fs.existsSync(filePath)) {
      return res.status(500).send(`
        <p>⚠️ No bin data available yet.<br/>Please check back later.</p>
      `);
    }

    const json = JSON.parse(fs.readFileSync(filePath, "utf8"));
    const results = json.results || [];
    const lastUpdated = new Date(json.lastUpdated).toLocaleString("en-GB", {
      timeZone: "Europe/London",
    });

    // Return raw JSON if requested (for debugging)
    if (req.query.format === "json") {
      return res.status(200).json(json);
    }

    // Filter to just Barvas & Brue entries (they share schedule)
    const barvasBrue = results.filter((r) =>
      /brue|barvas/i.test(r.area)
    );

    res.setHeader("Content-Type", "text/html");
    res.status(200).send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>BLUE Bin Collection Dates (Brue & Barvas)</title>
        <link rel="stylesheet" href="/style.css">
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body class="blue-page">
        <div class="container">
          <h1><i class="fas fa-recycle"></i> BLUE Bin Collection Dates (Brue & Barvas)</h1>

          ${
            barvasBrue.length
              ? barvasBrue
                  .map(
                    ({ area, dates }) => `
                      <h2>${area}</h2>
                      ${groupByMonth(dates)
                        .map(
                          ([month, monthDates]) => `
                            <h3>${month}</h3>
                            <ul>
                              ${monthDates
                                .map(
                                  (d) =>
                                    `<li><i class="fas fa-calendar-day"></i> ${d}</li>`
                                )
                                .join("")}
                            </ul>`
                        )
                        .join("")}
                    `
                  )
                  .join("")
              : "<p>No data found for Brue or Barvas.</p>"
          }

          <p><em>LAST UPDATED: ${lastUpdated}</em></p>
          <a class="back" href="/?lang=en">← Back</a>
        </div>
      </body>
      </html>
    `);
  } catch (err) {
    console.error("Blue bin render error:", err);
    res.status(500).send(`<p>Error loading data: ${err.message}</p>`);
  }
}
