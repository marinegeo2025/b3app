import fs from "fs";
import path from "path";
import axios from "axios";
import * as cheerio from "cheerio";

const URL =
  "https://www.cne-siar.gov.uk/bins-and-recycling/waste-recycling-collections-lewis-and-harris/organic-food-and-garden-waste-and-mixed-recycling-blue-bin/thursday-collections";

export default async function handler(req, res) {
  try {
    const response = await axios.get(URL, {
      headers: { "User-Agent": "Mozilla/5.0" },
      timeout: 15000,
    });
    const $ = cheerio.load(response.data);

    // --- Extract month headers ---
    const headers = [];
    $("thead th").each((_, th) => headers.push($(th).text().trim()));
    if (headers.length === 0) {
      $("tr")
        .first()
        .find("th,td")
        .each((_, cell) => headers.push($(cell).text().trim()));
    }
    const months = headers.slice(1);

    // --- Find Brue + Barvas rows and merge ---
    let combined = new Array(months.length).fill("");
    $("tbody tr, tr").each((_, row) => {
      const cells = $(row).find("td");
      if (cells.length >= 2) {
        const area = $(cells[0]).text().trim().toLowerCase();
        if (area.includes("brue") || area.includes("barvas")) {
          const values = $(cells)
            .slice(1)
            .map((_, td) => $(td).text().trim())
            .get();
          combined = combined.map((c, i) =>
            [c, values[i]].filter(Boolean).join(", ")
          );
        }
      }
    });

    const dates = [];
    months.forEach((month, i) => {
      const cell = combined[i];
      if (!cell) return;
      cell
        .split(",")
        .map((d) => d.trim())
        .filter(Boolean)
        .forEach((d) => dates.push(`${month} ${d}`));
    });

    const output = {
      lastUpdated: new Date().toISOString(),
      source: URL,
      results: [
        {
          area: "Brue & Barvas",
          dates,
        },
      ],
    };

    fs.writeFileSync(
      path.join(process.cwd(), "thursday.json"),
      JSON.stringify(output, null, 2),
      "utf8"
    );

    res.status(200).send(`✅ Thursday Blue Bin data saved for Brue & Barvas`);
  } catch (err) {
    console.error("❌ Error in Thursday scrape:", err);
    res.status(500).send(`Error: ${err.message}`);
  }
}
