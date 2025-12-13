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

// Convert ["January 3rd", ...] → { January: [3, ...] }
function convertToMonthData(dates = []) {
  const data = {};
  dates.forEach((d) => {
    const [month, dayRaw] = d.split(" ");
    const day = cleanDate(dayRaw);
    if (!isNaN(day)) {
      data[month] = data[month] || [];
      data[month].push(day);
    }
  });
  return data;
}

// Build ICS events
function buildEvents(binType, t, areaName, monthData) {
  const year = new Date().getFullYear();
  const events = [];

  for (const [month, days] of Object.entries(monthData)) {
    const monthIndex = new Date(`${month} 1, ${year}`).getMonth();
    if (isNaN(monthIndex)) continue;

    days.forEach((day) => {
      events.push({
        title: `${t[`${binType}Button`]} (${areaName})`,
        start: [year, monthIndex + 1, day],
      });
    });
  }

  return events;
}

export default async function handler(req, res) {
  const area = req.query.area === "barvas" ? "barvas" : "brue";
  const lang = req.query.lang === "gd" ? "gd" : "en";
  const t = translations[lang];

  try {
    // --- Load local JSON safely
    const loadJSON = (filename) => {
      const filePath = path.join(process.cwd(), filename);
      if (!fs.existsSync(filePath)) return null;
      return JSON.parse(fs.readFileSync(filePath, "utf8"));
    };

    const black = loadJSON("black.json");
    const blue = loadJSON("blue.json");
    const green = loadJSON("green.json");

    if (!black || !blue || !green) {
      throw new Error("Missing local JSON bin data");
    }

    // --- BLACK (shared)
    const blackDates = black.results.flatMap((r) => r.dates || []);
    const blackData = convertToMonthData(blackDates);

    // --- BLUE (shared – first block only)
    const blueBlock = blue.results[0];
    const blueData = blueBlock
      ? convertToMonthData(blueBlock.dates)
      : {};

    // --- GREEN (split)
    const greenBlock = green.results.find((r) =>
      area === "brue"
        ? /brue/i.test(r.area)
        : /barvas/i.test(r.area)
    );

    const greenData = greenBlock
      ? convertToMonthData(greenBlock.dates)
      : {};

    // --- Build events
    let events = [];

    events.push(
      ...buildEvents("black", t, "Brue & Barvas", blackData),
      ...buildEvents("blue", t, "Brue & Barvas", blueData),
      ...buildEvents(
        "green",
        t,
        area === "brue" ? "Brue" : "Barvas",
        greenData
      )
    );

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
    console.error("Calendar build error:", err);
    res.status(500).send(`${t.errorFetching} ${err.message}`);
  }
}
