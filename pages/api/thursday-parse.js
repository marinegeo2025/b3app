import fs from "fs";
import path from "path";

// 🧭 Helper: group date strings by month with “January 2026” logic
function groupByMonth(dates) {
  const groups = {};
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0 = Jan, 11 = Dec

  dates.forEach((d) => {
    const [month] = d.split(" ");
    let monthLabel = month;

    // Add next-year label if scraper runs in December and month is Jan–Mar
    if (currentMonth === 11 && /^(January|February|March)$/i.test(month)) {
      monthLabel = `${month} ${currentYear + 1}`;
    }

    groups[monthLabel] = groups[monthLabel] || [];
    groups[monthLabel].push(d);
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

    // 📦 Load the JSON file
    const json = fs.readFileSync(filePath, "utf8");
    const data = JSON.parse(json);

    const results = data.results || [];
    const lastUpdated = new Date(data.lastUpdated).toLocaleString("en-GB", {
      timeZone: "Europe/London",
    });

    // 🧩 Allow ?format=json for raw JSON output
    if (req.query.format === "json") {
      return res.status(200).json(data);
    }

    res.setHeader("Content-Type", "text/html");
    res.status(200).send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>BLUE Bin Collection Dates for Ness</title>
        <link rel="stylesheet" href="/style.css">
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body class="blue-page">
        <div class="container">
          <h1><i class="fas fa-recycle"></i> BLUE Bin Collection Dates for Ness</h1>
          ${
            results.length
              ? results
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
                        .join("")}`
                  )
                  .join("")
              : "<p>No data available.</p>"
          }
          <p class="last-updated"><em>LAST UPDATED: ${lastUpdated}</em></p>
          <a class="back" href="/?lang=en">← Back</a>
        </div>
      </body>
      </html>
    `);
  } catch (err) {
    console.error("Thursday parse error:", err);
    res.status(500).send(`<p>Error loading data: ${err.message}</p>`);
  }
}
