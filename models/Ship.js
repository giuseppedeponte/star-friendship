const mongoose = require('mongoose');
const shipSchema = new mongoose.Schema({
  name: String,
  score: Number,
  players: [{
    name: String,
    score: Number
  }],
  date: {
    type: Date,
    default: Date.now
  }
}, { bufferCommands: false });
module.exports = mongoose.model('Ship', shipSchema);
