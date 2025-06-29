// models/Room.js
const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  roomNumber: { type: String, required: true },
  location: { type: String, required: true },
  type: {
    type: String,
    enum: ['Lab', 'Classroom'],
    required: true,
  },
});

module.exports = mongoose.model('Room', roomSchema);
