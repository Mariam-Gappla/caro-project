const FAQ =require("../models/faq.js");
const { addFaqValidation } = require("../validation/faqValidition.js");
// 🟢 إضافة سؤال جديد
const addFaq = async (req, res, next) => {
  try {
    const lang = req.headers["accept-language"] || "en";
    const {questionEn, questionAr, answerEn, answerAr} = req.body;
    req.body.question = { en: questionEn, ar: questionAr };
    req.body.answer = { en: answerEn, ar: answerAr };
    delete req.body.questionEn;
    delete req.body.questionAr;
    delete req.body.answerEn;
    delete req.body.answerAr;
    const { error } = addFaqValidation(lang).validate(req.body);
    if (error) {
      return res.status(400).send({
        status: false,
        code:400,
        message: error.details[0].message
      });
    }
    await FAQ.create(req.body);
    res.status(200).send({
      status: true,
      code:200,
      message: lang === "ar" ? "تم إضافة السؤال بنجاح" : "FAQ added successfully",
    });
  } catch (err) {
    next(err);
  }
};

// 🟡 الحصول على كل الأسئلة حسب اللغة
const getFaqs = async (req, res, next) => {
  try {
    const lang = req.headers["accept-language"] || "en";
    const faqs = await FAQ.find();

    const formatted = faqs.map((f) => ({
      _id: f._id,
      question: f.question[lang],
      answer: f.answer[lang],
    }));

    res.status(200).send({
      status: true,
      message: lang === "ar" ? "تم جلب الأسئلة بنجاح" : "FAQs fetched successfully",
      data: formatted,
    });
  } catch (err) {
    next(err);
  }
};
module.exports = { addFaq, getFaqs };
