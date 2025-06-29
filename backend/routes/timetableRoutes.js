const express = require("express");
const router = express.Router();
const Timetable = require("../models/Timetable");

// Save timetable
router.post("/", async (req, res) => {
  try {
    const timetable = new Timetable(req.body);
    await timetable.save();
    // ✅ Send only the saved timetable array
    res.status(201).json({ timetable: timetable.timetable });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// (Optional) Fetch all saved timetables
router.get("/", async (req, res) => {
  try {
    const timetables = await Timetable.find();
    res.json(timetables);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET all timetables (e.g., across departments)
router.get("/all", async (req, res) => {
  try {
    const allTimetables = await Timetable.find();
    res.json(allTimetables);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/used", async (req, res) => {
  try {
    const timetables = await Timetable.find();
    const usedMap = {};

    timetables.forEach(tt => {
      tt.timetable.forEach(entry => {
        const slots = getTimeSlotsBetween(entry.start, entry.end);
        slots.forEach(ts => {
          const key = `${entry.room}_${entry.day}_${ts}`;
          usedMap[key] = true;
        });
      });
    });

    res.json(usedMap);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

function getTimeSlotsBetween(start, end) {
  const TIMESLOTS = [
    "08:30-09:30", "09:30-10:30", "10:30-11:30", "11:30-12:30",
    "13:30-14:30", "14:30-15:30", "15:30-16:30", "16:30-17:30"
  ];
  const indexStart = TIMESLOTS.findIndex(t => t.startsWith(start));
  const indexEnd = TIMESLOTS.findIndex(t => t.endsWith(end));
  return TIMESLOTS.slice(indexStart, indexEnd + 1);
}

module.exports = router;
