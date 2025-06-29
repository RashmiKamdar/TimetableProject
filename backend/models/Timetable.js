const mongoose = require("mongoose");

const timetableEntrySchema = new mongoose.Schema({
  day: String,
  start: String,
  end: String,
  subject: String,
  teacher: String,
  room: String,
  batch: String,
});

const timetableSchema = new mongoose.Schema({
  department: String,
  semesterType: String,
  semester: Number,
  batches: Number,
  timetable: [timetableEntrySchema]
});

module.exports = mongoose.model("Timetable", timetableSchema);
