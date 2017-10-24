const mongoose = require('mongoose');
const friendSchema = new mongoose.Schema({
  name: String,
  score: Number,
  game: String,
  date: {
    type: Date,
    default: Date.now
  }
}, { bufferCommands: false });
module.exports = mongoose.model('Friend', friendSchema);
