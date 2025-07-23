const mongoose = require("mongoose");

const nationalitySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
}, { timestamps: true });

module.exports = mongoose.model("Nationality", nationalitySchema);
