const mongoose = require("mongoose");

const assignmentSchema = new mongoose.Schema({
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher" },
  subjectId: { type: mongoose.Schema.Types.ObjectId, ref: "Subject" },
});

module.exports = mongoose.model("Assignment", assignmentSchema);
