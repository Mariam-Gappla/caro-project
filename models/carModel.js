const mongoose = require("mongoose");

const modelCarSchema = new mongoose.Schema({
  modelName: { type: String, required: true }
});

module.exports = mongoose.model("ModelCar", modelCarSchema);
