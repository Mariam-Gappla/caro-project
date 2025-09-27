const Joi = require("joi");
const getMessages=require("../locales/schemaValiditionMessages/searchValiditionMessages");
const searchValidationSchema = (lang = "en") => {
  const msg = getMessages(lang);

  return Joi.object({
    title: Joi.string().required().messages(msg.title),
    details: Joi.string().required().messages(msg.details),
    contactMethods: Joi.array()
      .items(Joi.string().valid("WhatsApp", "Call", "Chat"))
      .min(1)
      .required()
      .messages(msg.contactMethods),
    cityId: Joi.string().required().messages(msg.cityId),
    price: Joi.number().required().messages(msg.price),
    phoneNumber: Joi.when("contactMethods", {
      is: Joi.array().items(Joi.string().valid("WhatsApp", "Call")).has(Joi.string().valid("WhatsApp", "Call")),
      then: Joi.string().required().messages(msg.phoneNumberRequired),
      otherwise: Joi.string().optional(),
    }),
  });
};

module.exports = searchValidationSchema;