const Joi = require("joi");
const getMessages = require("../locales/schemaValiditionMessages/changePasswordValiditionMessages");

const changePasswordSchema = (lang = "en") => {
  const messages = getMessages(lang);

  return Joi.object({
    oldPassword: Joi.string()
      .required()
      .messages({
        "any.required": messages.oldPasswordRequired,
        "string.empty": messages.oldPasswordEmpty,
      }),
    newPassword: Joi.string()
      .min(6)
      .required()
      .messages({
        "any.required": messages.newPasswordRequired,
        "string.min": messages.newPasswordMin,
      }),
    confirmPassword: Joi.string()
      .valid(Joi.ref("newPassword"))
      .required()
      .messages({
        "any.required": messages.confirmPasswordRequired,
        "any.only": messages.confirmPasswordMismatch,
      }),
  });
};

module.exports = changePasswordSchema;
