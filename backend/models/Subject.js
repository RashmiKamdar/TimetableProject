const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
  name: String,
  department: String,
  semesterType: String,
  semester: Number,
  credits: Number,
  hoursPerWeek: Number,
  type: String,
});

module.exports = mongoose.model('Subject', subjectSchema);
