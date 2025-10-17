const mongoose = require("mongoose");

const carNamerSchema = new mongoose.Schema({
  rentalOfficeId: { type: mongoose.Schema.Types.ObjectId, ref: 'rentalOffice', required: true },
  image:{type: String, required: true},
  carName: {
    en: { type: String, required: true },
    ar: { type: String, required: true },
  }
});

module.exports = mongoose.model("CarName", carNamerSchema);