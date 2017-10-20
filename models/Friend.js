const mongoose = require('mongoose');
const friendSchema = new mongoose.Schema({
  name: String,
  score: Number,
  game: String,
  date: {
    type: Date,
    default: Date.now
  }
});
module.exports = mongoose.model('Friend', friendSchema);
