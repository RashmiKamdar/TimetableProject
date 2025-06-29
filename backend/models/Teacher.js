const mongoose = require("mongoose");

const teacherSchema = new mongoose.Schema({
  name: { type: String, required: true },
  teacherId: { type: String, required: true, unique: true },
  department: { type: String, required: true },
  semesters: [{ type: Number, enum: [1,2,3,4,5,6,7,8] }],
});

module.exports = mongoose.model("Teacher", teacherSchema);
