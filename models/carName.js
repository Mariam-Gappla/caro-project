const mongoose = require("mongoose");

const carNamerSchema = new mongoose.Schema({
  carName: { type: String, required: true }
});

module.exports = mongoose.model("CarName", carNamerSchema);