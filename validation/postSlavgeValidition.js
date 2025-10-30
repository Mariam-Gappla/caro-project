const Joi = require("joi");
const getMessages = require("../locales/schemaValiditionMessages/slavgeValiditionMessages")
const salvagePostSchema = (lang = "en") => {
  const messages = getMessages(lang)

  return Joi.object({
    title: Joi.string().required().messages(messages.title),

    details: Joi.string().required().messages(messages.details),

    location: Joi.object({
      type: Joi.string().valid("Point").required().messages({
        "string.base": messages.location["string.base"],
        "any.only": messages.location["any.only"],
        "any.required": messages.location["any.required"],
      }),
      coordinates: Joi.array()
        .items(Joi.number().messages({ "number.base": messages.location["number.base"] }))
        .length(2)
        .required()
        .messages({
          "array.base": messages.location["array.base"],
          "array.length": messages.location["array.length"],
          "any.required": messages.location["any.required"],
        }),
    })
      .required()
      .messages(messages.location),
    locationText: Joi.string().required().messages(messages.location),
  });
};

module.exports = salvagePostSchema
