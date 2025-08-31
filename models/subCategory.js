const mongoose = require("mongoose");
const categorySchema = new mongoose.Schema(
  {
    name: {
      en: { type: String, required: true ,unique: true},
     ar: { type: String, required: true, unique: true }
    },
    mainCategoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MainCategory",
      required: true
    }
  },
  {
    timestamps: true // بيضيف createdAt و updatedAt تلقائيًا
  }
);

module.exports = mongoose.model("SubCategory", categorySchema);
