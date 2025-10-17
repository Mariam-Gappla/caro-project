const mongoose=require("mongoose");
const packageSchema = new mongoose.Schema(
  {
    title: {
      en: { type: String, required: true },
      ar: { type: String, required: true },
    },
    duration: {
      type: Number,
      required: true, // المدة بالأيام أو الشهور
    },
    price: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

const Package = mongoose.model("Package", packageSchema);
module.exports=Package;
