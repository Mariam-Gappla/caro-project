const mongoose = require("mongoose");

const modelCarSchema = new mongoose.Schema({
  TypeName: { type: String, required: true },
  nameId:{ type: mongoose.Schema.Types.ObjectId, ref: "CarName", required: true },
});

module.exports = mongoose.model("TypeCar", modelCarSchema);
