const Joi= require("joi");
const getMessages=require("../locales/schemaValiditionMessages/faqValiditionMessages.js") ;

const addFaqValidation = (lang = "en") => {
  const msg = getMessages(lang);
  return Joi.object({
    question: Joi.object({
      en: Joi.string().required().messages({
        "any.required": msg.requiredQuestionEn,
        "string.empty": msg.requiredQuestionEn,
      }),
      ar: Joi.string().required().messages({
        "any.required": msg.requiredQuestionAr,
        "string.empty": msg.requiredQuestionAr,
      }),
    }).required(),
    answer: Joi.object({
      en: Joi.string().required().messages({
        "any.required": msg.requiredAnswerEn,
        "string.empty": msg.requiredAnswerEn,
      }),
      ar: Joi.string().required().messages({
        "any.required": msg.requiredAnswerAr,
        "string.empty": msg.requiredAnswerAr,
      }),
    }).required(),
  });
};
module.exports = { addFaqValidation };
