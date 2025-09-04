const mongoose = require("mongoose");
const serviceSubCategorySchema = new mongoose.Schema(
  {
    name: {
      en: { type: String, required: true ,unique: true},
     ar: { type: String, required: true, unique: true }
    },
    image:{
       type:String,
       required:true
    },
    mainCategoryCenterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MainCategoryCenter",
      required: true
    }
  },
  {
    timestamps: true // بيضيف createdAt و updatedAt تلقائيًا
  }
);

module.exports = mongoose.model("Service", serviceSubCategorySchema);
