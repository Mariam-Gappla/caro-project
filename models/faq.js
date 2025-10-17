const mongoose= require("mongoose");
const faqSchema = new mongoose.Schema(
  {
    question: {
      en: { type: String, required: true },
      ar: { type: String, required: true },
    },
    answer: {
      en: { type: String, required: true },
      ar: { type: String, required: true },
    },
  },
  { timestamps: true }
);

const FAQ = mongoose.model("FAQ", faqSchema);
module.exports = FAQ;
