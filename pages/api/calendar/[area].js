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

// Convert ["December 11th", ...] → { December: [11, ...] }
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
function buildEvents(binType, t, areaName, data) {
  const year = new Date().getFullYear();
  const events = [];

  for (const [month, days] of Object.entries(data)) {
    const monthIndex = new Date(`${month} 1, ${year}`).getMonth();
    if (isNaN(monthIndex)) continue;

    for (const day of days) {
      events.push({
        title: `${t[`${binType}Button`]} (${areaName})`,
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

    // --- Black & Blue apply to BOTH areas
    const blackData = convertToMonthData(black.results?.[0]?.dates || []);
    const blueData = convertToMonthData(blue.results?.[0]?.dates || []);

    // --- Green depends on area
    const greenBlock =
      area === "brue"
        ? green.results.find((r) => /brue/i.test(r.area))
        : green.results.find((r) => /barvas/i.test(r.area));

    const greenData = greenBlock
      ? convertToMonthData(greenBlock.dates)
      : {};

    let events = [
      ...buildEvents("black", t, "Brue & Barvas", blackData),
      ...buildEvents("blue", t, "Brue & Barvas", blueData),
      ...buildEvents(
        "green",
        t,
        area === "brue" ? "Brue" : "Barvas",
        greenData
      ),
    ];

    if (!events.length) {
      return res.status(500).send(t.noData);
    }

    const { error, value } = createEvents(events);
    if (error) throw error;

    res.setHeader("Content-Type", "text/calendar; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${area}-bin-schedule-${lang}.ics"`
    );
    res.send(value);
  } catch (err) {
    console.error("Calendar error:", err);
    res.status(500).send(`${t.errorFetching} ${err.message}`);
  }
}
