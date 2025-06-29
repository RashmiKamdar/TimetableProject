const express = require("express");
const router = express.Router();
const Room = require("../models/Room");

// CREATE
router.post("/", async (req, res) => {
  try {
    const { roomNumber, location, type } = req.body;

    // Validate type
    if (!['Lab', 'Classroom'].includes(type)) {
      return res.status(400).json({ message: "Invalid room type. Must be 'Lab' or 'Classroom'." });
    }

    const room = new Room({ roomNumber, location, type });
    await room.save();
    res.status(201).json(room);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// READ ALL
router.get("/", async (req, res) => {
  try {
    const rooms = await Room.find();
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// UPDATE
router.put("/:id", async (req, res) => {
  try {
    const { type } = req.body;

    // Optional validation on update
    if (type && !['Lab', 'Classroom'].includes(type)) {
      return res.status(400).json({ message: "Invalid room type. Must be 'Lab' or 'Classroom'." });
    }

    const updated = await Room.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true } // run schema validators
    );

    if (!updated) return res.status(404).json({ message: "Room not found" });

    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Room.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Room not found" });

    res.json({ message: "Room deleted" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
