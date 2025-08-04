const mongoose = require("mongoose");

const carTypeSchema = new mongoose.Schema({
  type: { type: String, required: true, unique: true } // "SUV"
});


module.exports = mongoose.model("carType", carTypeSchema);
