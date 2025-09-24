const mongoose=require("mongoose");
const conditionSchema = new mongoose.Schema({
  name: {
    en:{required:true,type:String},
    ar:{required:true,type:String},
  },
}, { timestamps: true });

module.exports = mongoose.model("Condition", conditionSchema);
