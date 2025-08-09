const mongoose = require("mongoose");
const modelSchema = new mongoose.Schema({
  rentalOfficeId: { type: mongoose.Schema.Types.ObjectId, ref: 'rentalOffice', required: true },
  typeId: { type: mongoose.Schema.Types.ObjectId, ref: 'carType', required: true },
  model: {
    en: { type: String, required: true },
    ar: { type: String, required: true },
  }, // "Corolla 2022"
});
module.exports = mongoose.model("CarModel", modelSchema);
