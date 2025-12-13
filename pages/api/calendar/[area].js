import fs from "fs";
import path from "path";
import { createEvents } from "ics";
import translations from "../../../lib/translations";

// Clean "21st" → 21
function cleanDay(str) {
  const m = str.match(/^(\d{1,2})/);
  return m ? parseInt(m[1], 10) : null;
}

function monthIndex(month) {
  return new Date(`${month} 1, 2000`).getMonth();
}

function buildEvents(title, dates) {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const events = [];

  dates.forEach((d) => {
    const [month, dayRaw] = d.split(" ");
    const day = cleanDay(dayRaw);
    const mIndex = monthIndex(month);
    if (day === null || isNaN(mIndex)) return;

    const year =
      currentMonth === 11 && mIndex <= 2 ? currentYear + 1 : currentYear;

    events.push({
      title,
      start: [year, mIndex + 1, day],
    });
  });

  return events;
}

export default function handler(req, res) {
  const { area } = req.query; // brue | barvas
  const lang = req.query.lang === "gd" ? "gd" : "en";
  const t = translations[lang];

  try {
    const black = JSON.parse(fs.readFileSync("black.json", "utf8"));
    const blue = JSON.parse(fs.readFileSync("blue.json", "utf8"));
    const green = JSON.parse(fs.readFileSync("green.json", "utf8"));

    let events = [];

    events.push(
      ...buildEvents(
        `${t.blackButton} (Brue & Barvas)`,
        black.dates || []
      )
    );

    const blueBlock = blue.results.find((r) =>
      /brue|barvas/i.test(r.area)
    );
    if (blueBlock) {
      events.push(
        ...buildEvents(
          `${t.blueButton} (Brue & Barvas)`,
          blueBlock.dates
        )
      );
    }

    const greenBlock = green.results.find((r) =>
      /brue/i.test(r.area)
    );
    if (greenBlock) {
      events.push(
        ...buildEvents(
          `${t.greenButton} (Brue)`,
          greenBlock.dates
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
    console.error(err);
    res.status(500).send(`${t.errorFetching} ${err.message}`);
  }
}
