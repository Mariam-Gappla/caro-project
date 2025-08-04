const mongoose = require("mongoose");
const modelSchema = new mongoose.Schema({
  name: { type: String, required: true }, // "Corolla 2022"
  carNameId: { type: mongoose.Schema.Types.ObjectId, ref: 'CarName', required: true },
  carTypeId: { type: mongoose.Schema.Types.ObjectId, ref: 'CarType', required: true }
});
module.exports = mongoose.model("CarModel", modelSchema);
