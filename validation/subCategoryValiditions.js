const Joi = require("joi");
const getMessages=require("../locales/schemaValiditionMessages/subCategoryValiditionMessages");
const subCategorySchema = (lang = "en") => {
  const messages = getMessages(lang);

  return Joi.object({
    name: Joi.string().required().messages({
      "string.empty": messages.nameRequired,
      "any.required": messages.nameRequired
    }),
  });
};

module.exports = subCategorySchema;