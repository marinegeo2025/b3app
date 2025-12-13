import fs from "fs";
import path from "path";
import { createEvents } from "ics";
import translations from "../../../lib/translations.js";

// Clean “21st” → 21
function cleanDate(d) {
  if (!d) return null;
  const match = d.trim().match(/^(\d+)/);
  return match ? parseInt(match[1], 10) : null;
}

// Convert ["December 11th"] → { December: [11] }
function toMonthMap(dates = []) {
  const map = {};
  dates.forEach((d) => {
    const [month, dayRaw] = d.split(" ");
    const day = cleanDate(dayRaw);
    if (!isNaN(day)) {
      map[month] = map[month] || [];
      map[month].push(day);
    }
  });
  return map;
}

// Build ICS events
function buildEvents(binKey, t, label, monthMap) {
  const year = new Date().getFullYear();
  const events = [];

  for (const [month, days] of Object.entries(monthMap)) {
    const monthIndex = new Date(`${month} 1, ${year}`).getMonth();
    if (isNaN(monthIndex)) continue;

    for (const day of days) {
      events.push({
        title: `${t[`${binKey}Button`]} (${label})`,
        start: [year, monthIndex + 1, day],
      });
    }
  }

  return events;
}

export default function handler(req, res) {
  const { area } = req.query; // brue | barvas
  const lang = req.query.lang === "gd" ? "gd" : "en";
  const t = translations[lang];

  try {
    const load = (file) => {
      const filePath = path.join(
        process.cwd(),
        "public",
        "data",
        file
      );
      if (!fs.existsSync(filePath)) {
        throw new Error(`Missing data file: ${file}`);
      }
      return JSON.parse(fs.readFileSync(filePath, "utf8"));
    };

    const black = load("black.json");
    const blue = load("wednesday.json");
    const green = load("green.json");

    // Black & Blue are shared Brue+Barvas
    const blackBlock = black.results.find(r =>
      /barvas|brue/i.test(r.area)
    );
    const blueBlock = blue.results.find(r =>
      /barvas|brue/i.test(r.area)
    );

    // Green is split
    const greenBlock =
      area === "brue"
        ? green.results.find(r => /brue/i.test(r.area))
        : green.results.find(r => /barvas/i.test(r.area));

    if (!blackBlock || !blueBlock || !greenBlock) {
      throw new Error("Required bin route not found in JSON");
    }

    const events = [
      ...buildEvents("black", t, "Brue & Barvas", toMonthMap(blackBlock.dates)),
      ...buildEvents("blue", t, "Brue & Barvas", toMonthMap(blueBlock.dates)),
      ...buildEvents(
        "green",
        t,
        area === "brue" ? "Brue → Carloway" : "Barvas → Galson",
        toMonthMap(greenBlock.dates)
      ),
    ];

    const { error, value } = createEvents(events);
    if (error) throw error;

    res.setHeader("Content-Type", "text/calendar; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${area}-bin-calendar-${lang}.ics"`
    );
    res.send(value);
  } catch (err) {
    console.error("Calendar error:", err);
    res.status(500).send(`${t.errorFetching} ${err.message}`);
  }
}
