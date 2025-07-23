const Joi = require("joi");
const getMessages = require("../locales/schemaValiditionMessages/vehicalValiditionMessages");

const recoveryVehicleTypeSchema = (lang = "en") => {
  const  msg = getMessages(lang);
  return Joi.object({
    name: Joi.string()
      .required()
      .messages({
        "any.required": msg.nameRequired,
        "string.base": msg.nameString,
      }),
  });
};

module.exports = recoveryVehicleTypeSchema;
