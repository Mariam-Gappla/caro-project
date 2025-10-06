const mongoose = require("mongoose");

const slavgeServiceSchema = new mongoose.Schema({
  name: {
    ar: { type: String, required: true},
    en: { type: String, required: true}
  },
}, { timestamps: true });

module.exports = mongoose.model("SlavgeService", slavgeServiceSchema);
