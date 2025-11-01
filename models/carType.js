const mongoose = require("mongoose");

const carTypeSchema = new mongoose.Schema({
  nameId: { type: mongoose.Schema.Types.ObjectId, ref: 'CarName', required: true },
  type: {
    en: { type: String, required: true },
    ar: { type: String, required: true },
  } // "SUV"
});


module.exports = mongoose.model("carType", carTypeSchema);
