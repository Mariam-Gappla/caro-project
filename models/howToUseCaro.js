const mongoose = require('mongoose');

const howToUseCaroSchema = new mongoose.Schema({
  videos: [
    {
      url: { type: String, required: true }
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('HowToUseCaro', howToUseCaroSchema);
