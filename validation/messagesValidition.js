// validations/messageValidation.js
const Joi = require('joi');
const getMessages = require("../locales/schemaValiditionMessages/chatValiditionMessages");
const messageSchema = (lang = "en") => {
    const messages = getMessages(lang)
    return Joi.object({
        from: Joi.string().required().messages(
            {
                'string.base': messages.from.string.base,
                'any.required': messages.from.any.required,
            }
        ),
        to: Joi.string().required().messages({
            'string.base': messages.to.string.base,
            'any.required': messages.to.any.required

        }),
        message: Joi.string().required().messages({
            'string.base': messages.message.string.base,
            'any.required': messages.message.string.base,
        }),
        timestamp: Joi.date().optional()
    });
}


module.exports = messageSchema;
