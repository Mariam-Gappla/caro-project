const Joi = require("joi");
const getMessages = require("../locales/schemaValiditionMessages/centerServiceValiditionMessages");

const centerServiceSchema = (lang = "en") => {
  const messages = getMessages(lang)
  return Joi.object({
    details: Joi.string().required().messages({
      "string.base": messages.details.string,
      "any.required": messages.details.required,
      "string.empty": messages.details.required
    }),
    services: Joi.array().items(Joi.string().regex(/^[0-9a-fA-F]{24}$/)).min(1).required().messages({
      "array.base": messages.services.base,
      "array.min": messages.services.required,
      "any.required": messages.services.required
    }),
    location: Joi.object({
      lat: Joi.number()
        .required()
        .messages({
          "number.base": messages.location.lat.base,
          "any.required": messages.location.long.required
        }),
      long: Joi.number()
        .required()
        .messages({
          "number.base": messages.location.long.base,
          "any.required": messages.location.long.base,
        })
    })
  });
};

module.exports = centerServiceSchema;
