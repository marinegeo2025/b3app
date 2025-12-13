import fs from "fs";
import path from "path";
import { createEvents } from "ics";
import translations from "../../../lib/translations";

// "January 21st" → { month: "January", day: 21 }
function parseDate(d) {
  const parts = d.trim().split(" ");
  if (parts.length < 2) return null;

  const month = parts[0];
  const dayMatch = parts[1].match(/^(\d+)/);
  if (!dayMatch) return null;

  return {
    month,
    day: parseInt(dayMatch[1], 10),
  };
}

function buildEvents(title, dates) {
  const year = new Date().getFullYear();
  const events = [];

  dates.forEach((d) => {
    const parsed = parseDate(d);
    if (!parsed) return;

    const monthIndex = new Date(`${parsed.month} 1, ${year}`).getMonth();
    if (isNaN(monthIndex)) return;

    events.push({
      title,
      start: [year, monthIndex + 1, parsed.day],
    });
  });

  return events;
}

export default function handler(req, res) {
  const area = req.query.area === "barvas" ? "barvas" : "brue";
  const lang = req.query.lang === "gd" ? "gd" : "en";
  const t = translations[lang];

  try {
    const load = (f) =>
      JSON.parse(fs.readFileSync(path.join(process.cwd(), f), "utf8"));

    const black = load("black.json");
    const blue = load("blue.json");
    const green = load("green.json");

    let events = [];

    // --- BLACK (shared)
    black.results.forEach((r) => {
      events.push(
        ...buildEvents(`${t.blackButton} (Brue & Barvas)`, r.dates || [])
      );
    });

    // --- BLUE (shared – first/top section only)
    if (blue.results?.length) {
      events.push(
        ...buildEvents(
          `${t.blueButton} (Brue & Barvas)`,
          blue.results[0].dates || []
        )
      );
    }

    // --- GREEN (split correctly)
    const greenBlock = green.results.find((r) =>
      area === "brue"
        ? /brue/i.test(r.area)
        : /barvas/i.test(r.area)
    );

    if (greenBlock) {
      events.push(
        ...buildEvents(
          `${t.greenButton} (${area === "brue" ? "Brue" : "Barvas"})`,
          greenBlock.dates || []
        )
      );
    }

    if (!events.length) {
      return res.status(500).send(t.noData);
    }

    const { error, value } = createEvents(events);
    if (error) throw error;

    res.setHeader("Content-Type", "text/calendar; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${area}-bins-${lang}.ics"`
    );
    res.send(value);
  } catch (err) {
    console.error("Calendar error:", err);
    res.status(500).send(`${t.errorFetching} ${err.message}`);
  }
}
