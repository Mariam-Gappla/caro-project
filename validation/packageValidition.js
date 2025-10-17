const Joi= require("joi");
const getMessages = require("../locales/schemaValiditionMessages/packageValiditionMessages");
const addPackageValidation = (lang = "en") => {
  const msg = getMessages(lang);
  console.log(msg);
  return Joi.object({
    title: Joi.object({
      en: Joi.string().required().messages({
        "any.required": msg.requiredTitleEn,
        "string.empty": msg.requiredTitleEn,
      }),
      ar: Joi.string().required().messages({
        "any.required": msg.requiredTitleAr,
        "string.empty": msg.requiredTitleAr,
      }),
    }).required(),
    duration: Joi.number().positive().required().messages({
      "any.required": msg.requiredDuration,
      "number.base": msg.invalidDuration,
      "number.positive": msg.invalidDuration,
    }),
    price: Joi.number().positive().required().messages({
      "any.required": msg.requiredPrice,
      "number.base": msg.invalidPrice,
      "number.positive": msg.invalidPrice,
    }),
  });
};
module.exports = {addPackageValidation};
