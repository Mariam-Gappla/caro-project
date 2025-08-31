const mongoose = require("mongoose");

const citySchema = new mongoose.Schema({
  name: {
    ar: { type: String, required: true, trim: true },
    en: { type: String, required: true, trim: true }
  },
}, { timestamps: true });

module.exports = mongoose.model("City", citySchema);
