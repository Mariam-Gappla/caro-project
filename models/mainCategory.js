const mongoose = require("mongoose");

const mainCategorySchema = new mongoose.Schema(
  {
    name: {
     en: { type: String, required: true ,unique: true},
     ar: { type: String, required: true, unique: true }
    },
  },
  {
    timestamps: true // بيضيف createdAt و updatedAt تلقائيًا
  }
);

module.exports = mongoose.model("MainCategory", mainCategorySchema);