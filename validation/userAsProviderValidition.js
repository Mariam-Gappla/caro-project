const Joi = require("joi");
const getMessages = require("../locales/schemaValiditionMessages/userAsProviderMessages");
const userAsProviderSchema = (lang = "en") => {
    const messages = getMessages(lang);
      console.log(messages)
    return Joi.object({
        cityId: Joi.string().required().messages({
            "string.empty": messages.cityId,
            "any.required": messages.cityId
        }),
        whatsAppNumber: Joi.string().required().messages({
            "string.empty": messages.whatsAppNumber,
            "any.required": messages.whatsAppNumber
        }),
        details: Joi.string().required().messages({
            "string.empty": messages.details,
            "any.required": messages.details
        }),
        categoryCenterId: Joi.string().required().messages({
            "string.empty": messages.categoryCenterId,
            "any.required": messages.categoryCenterId
        }),
        subCategoryCenterId: Joi.string().required().messages({
            "string.empty": messages.subCategoryCenterId,
            "any.required": messages.subCategoryCenterId
        }),
        tradeRegisterNumber: Joi.string().required().messages({
            "string.empty": messages.tradeRegisterNumber,
            "any.required": messages.tradeRegisterNumber
        }),
        username: Joi.string().required().messages({
            "string.empty": messages.userName,
            "any.required": messages.userName
        }),
        email:Joi.string().required().messages({
            "string.empty": messages.email,
            "any.required": messages.email
        }),
    });
};

module.exports = userAsProviderSchema;