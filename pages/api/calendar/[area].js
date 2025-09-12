// pages/api/calendar/[area].js
import axios from "axios";
import * as cheerio from "cheerio";
import { createEvents } from "ics";
import translations from "../../../lib/translations";
import { validateBinTable } from "../../../lib/failsafe";

const BLACK_URL =
  "https://www.cne-siar.gov.uk/bins-and-recycling/waste-recycling-collections-lewis-and-harris/non-recyclable-waste-grey-bin-purple-sticker/wednesday-collections";
const BLUE_URL =
  "https://www.cne-siar.gov.uk/bins-and-recycling/waste-recycling-collections-lewis-and-harris/organic-food-and-garden-waste-and-mixed-recycling-blue-bin/thursday-collections";
const GREEN_URL =
  "https://www.cne-siar.gov.uk/bins-and-recycling/waste-recycling-collections-lewis-and-harris/glass-green-bin-collections/friday-collections";

// Clean "21st" → 21
function cleanDate(d) {
  if (!d) return null;
  const match = d.trim().match(/^(\d+)/);
  return match ? parseInt(match[1], 10) : null;
}

// Parse a bin table into { month: [dates...] } for a given keyword row (e.g., "Brue")
function parseBinTable($, keyword) {
  const headers = [];
  $("thead th").each((i, th) => headers.push($(th).text().trim()));
  if (headers.length === 0) {
    $("tr").first().find("th,td").each((i, cell) => headers.push($(cell).text().trim()));
  }

  const data = {};
  const rows = $("tbody tr").length ? $("tbody tr") : $("tr").slice(1);
  rows.each((_, row) => {
    const cells = $(row).find("th,td");
    if (cells.length >= 2) {
      const area = $(cells[0]).text().trim();
      if (area.toLowerCase().includes(keyword.toLowerCase())) {
        for (let i = 1; i < cells.length; i++) {
          const month = headers[i];
          const dates = $(cells[i]).text().trim();
          if (month && dates && dates.toLowerCase() !== "n/a") {
            const parts = dates
              .split(",")
              .map((x) => cleanDate(x))
              .filter(Boolean);
            if (parts.length) {
              data[month] = (data[month] || []).concat(parts);
            }
          }
        }
      }
    }
  });
  return data;
}

// Convert parsed data to ICS events
function buildEvents(binType, t, areaName, data) {
  const year = new Date().getFullYear();
  const events = [];

  for (const [month, days] of Object.entries(data)) {
    for (const day of days) {
      const monthIndex = new Date(`${month} 1, ${year}`).getMonth();
      if (isNaN(monthIndex)) continue;
      events.push({
        title: `${t[`${binType}Button`]} (${areaName})`,
        start: [year, monthIndex + 1, day],
      });
    }
  }
  return events;
}

export default async function handler(req, res) {
  const { area } = req.query; // "brue" or "barvas"
  const lang = req.query.lang === "en" ? "en" : "gd";
  const t = translations[lang];

  try {
    // --- Black bins (Brue + Barvas together) ---
    const blackResp = await axios.get(BLACK_URL, { headers: { "User-Agent": "Mozilla/5.0" } });
    const $black = cheerio.load(blackResp.data);
    validateBinTable($black, { expectedMonths: [], requiredKeyword: "Brue" });
    validateBinTable($black, { expectedMonths: [], requiredKeyword: "Barvas" });

    const blackData = {};
    ["Brue", "Barvas"].forEach((kw) => {
      const part = parseBinTable($black, kw);
      for (const [m, days] of Object.entries(part)) {
        blackData[m] = (blackData[m] || []).concat(days);
      }
    });

    // --- Blue bins (Brue + Barvas together) ---
    const blueResp = await axios.get(BLUE_URL, { headers: { "User-Agent": "Mozilla/5.0" } });
    const $blue = cheerio.load(blueResp.data);
    validateBinTable($blue, { expectedMonths: [], requiredKeyword: "Brue" });
    validateBinTable($blue, { expectedMonths: [], requiredKeyword: "Barvas" });

    const blueData = {};
    ["Brue", "Barvas"].forEach((kw) => {
      const part = parseBinTable($blue, kw);
      for (const [m, days] of Object.entries(part)) {
        blueData[m] = (blueData[m] || []).concat(days);
      }
    });

    // --- Green bins (separate per area) ---
    const greenResp = await axios.get(GREEN_URL, { headers: { "User-Agent": "Mozilla/5.0" } });
    const $green = cheerio.load(greenResp.data);
    validateBinTable($green, { expectedMonths: [], requiredKeyword: "Brue" });
    validateBinTable($green, { expectedMonths: [], requiredKeyword: "Barvas" });

    const greenDataBrue = parseBinTable($green, "Brue");
    const greenDataBarvas = parseBinTable($green, "Barvas");

    // --- Build events ---
    let events = [];
    if (area === "brue") {
      events = [
        ...buildEvents("black", t, "Brue & Barvas", blackData),
        ...buildEvents("blue", t, "Brue & Barvas", blueData),
        ...buildEvents("green", t, "Brue", greenDataBrue),
      ];
    } else if (area === "barvas") {
      events = [
        ...buildEvents("black", t, "Brue & Barvas", blackData),
        ...buildEvents("blue", t, "Brue & Barvas", blueData),
        ...buildEvents("green", t, "Barvas", greenDataBarvas),
      ];
    } else {
      return res.status(404).send(lang === "en" ? "Area not found" : "Cha deach sgìre a lorg");
    }

    if (events.length === 0) {
      return res.status(500).send(t.noData);
    }

    const { error, value } = createEvents(events);
    if (error) {
      console.error("ICS Error:", error, events);
      return res.status(500).send(t.errorFetching);
    }

    res.setHeader("Content-Type", "text/calendar; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${area}-bin-schedule-${lang}.ics"`
    );
    res.send(value);
  } catch (err) {
    console.error("Calendar build error:", err);
    res.status(500).send(`${t.errorFetching} ${err.message}`);
  }
}
