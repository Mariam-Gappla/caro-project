const mongoose = require("mongoose");

const advantageSchema = new mongoose.Schema({
  name: {
    ar: { type: String, required: true, trim: true },
    en: { type: String, required: true, trim: true }
  },
}, { timestamps: true });

module.exports = mongoose.model("Advantage", advantageSchema);
