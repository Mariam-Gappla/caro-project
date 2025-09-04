const mongoose = require("mongoose");
const subCategoryCenterSchema = new mongoose.Schema(
  {
    name: {
      en: { type: String, required: true ,unique: true},
     ar: { type: String, required: true, unique: true }
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

module.exports = mongoose.model("SubCategoryCenter", subCategoryCenterSchema);
