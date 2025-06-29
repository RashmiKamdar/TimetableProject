const express = require("express");
const router = express.Router();
const Assignment = require("../models/Assignment");
const Teacher = require("../models/Teacher");
const Subject = require("../models/Subject");

// GET all assignments with populated names (safe version)
router.get("/", async (req, res) => {
  try {
    const assignments = await Assignment.find()
      .populate("teacherId", "name")
      .populate("subjectId", "name");

    const formatted = assignments.map(a => ({
      _id: a._id,
      teacherId: a.teacherId?._id || null,
      teacherName: a.teacherId?.name || "Unknown",
      subjectId: a.subjectId?._id || null,
      subjectName: a.subjectId?.name || "Unknown",
      department: a.department || "N/A",
      semester: a.semester || "N/A",
      semesterType: a.semesterType || "N/A"
    }));

    res.json(formatted);
  } catch (err) {
    console.error("Error fetching assignments:", err.message);
    res.status(500).json({ error: "Failed to fetch assignments" });
  }
});

// CREATE
router.post("/", async (req, res) => {
  try {
    const assignment = new Assignment(req.body);
    await assignment.save();
    res.status(201).json(assignment);
  } catch (err) {
    console.error("Error creating assignment:", err.message);
    res.status(500).json({ error: "Failed to create assignment" });
  }
});

// UPDATE
router.put("/:id", async (req, res) => {
  try {
    const updated = await Assignment.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    console.error("Error updating assignment:", err.message);
    res.status(500).json({ error: "Failed to update assignment" });
  }
});

// DELETE
router.delete("/:id", async (req, res) => {
  try {
    await Assignment.findByIdAndDelete(req.params.id);
    res.sendStatus(204);
  } catch (err) {
    console.error("Error deleting assignment:", err.message);
    res.status(500).json({ error: "Failed to delete assignment" });
  }
});

module.exports = router;
