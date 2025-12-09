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

    const headers = [];
    $("thead th").each((_, th) => headers.push($(th).text().trim()));
    if (headers.length === 0) {
      $("tr")
        .first()
        .find("th,td")
        .each((_, cell) => headers.push($(cell).text().trim()));
    }
    const months = headers.slice(1);

    const results = [];
    $("tbody tr, tr").each((_, row) => {
      const cells = $(row).find("th,td");
      if (cells.length >= 2) {
        const area = $(cells[0]).text().trim();
        if (area.toLowerCase().includes("brue") || area.toLowerCase().includes("barvas")) {
          const dates = [];
          for (let i = 1; i < cells.length; i++) {
            const month = months[i - 1];
            const text = $(cells[i]).text().trim();
            if (text && month) {
              text
                .split(",")
                .map((d) => d.trim())
                .filter(Boolean)
                .forEach((d) => dates.push(`${month} ${d}`));
            }
          }
          results.push({ area, dates });
        }
      }
    });

    const output = {
      lastUpdated: new Date().toISOString(),
      source: URL,
      results,
    };

    const filePath = path.join(process.cwd(), "thursday.json");
    fs.writeFileSync(filePath, JSON.stringify(output, null, 2), "utf8");

    res.status(200).send(`✅ Thursday bin data updated (${results.length} rows)`);
  } catch (err) {
    console.error("Error in thursday-parse:", err);
    res.status(500).send(`Error: ${err.message}`);
  }
}
