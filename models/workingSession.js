const mongoose = require('mongoose');

const workingSessionSchema = new mongoose.Schema({
  providerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ServiceProvider',
    required: true
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date
  },
  isWorking: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model('WorkingSession', workingSessionSchema);
