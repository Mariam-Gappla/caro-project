const Joi = require("joi");
const messages = require("../locales/schemaValiditionMessages/carNameValiditionMessages");

const modelSchema = (lang = "en") => {
  const m = messages[lang] || messages.en;

  return Joi.object({
    modelName: Joi.string().required().messages({
      "any.required": m.modelNameRequired,
      "string.base": m.modelNameString,
    }),
  });
};

module.exports = modelSchema;
