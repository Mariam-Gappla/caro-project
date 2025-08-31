const mongoose = require("mongoose");

const areaSchema = new mongoose.Schema({
  name: {
    ar: { type: String, required: true, trim: true },
    en: { type: String, required: true, trim: true }
  },
  cityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "City",
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model("Area", areaSchema);
