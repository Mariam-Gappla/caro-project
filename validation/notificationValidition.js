const Joi = require("joi");
const getMessages = require("../locales/schemaValiditionMessages/commentsValiditionMessages")
const createNotificationSchema = (lang = "en") => {
    const messages = getMessages(lang);
    return Joi.object({
        userId: Joi.string().optional().messages({
            "string.base": messages.userId.base,
        }),
        rentalOfficeId: Joi.string().optional().messages({
            "string.base": messages.rentalOfficeId.base,
        }),
        orderId: Joi.string().required().messages({
            "any.required": messages.orderId.required,
            "string.base": messages.orderId.base,
        }),
        type: Joi.string().valid("newOrder", "statusChanged", "review", "ended").required().messages({
            "any.required": messages.type.required,
            "any.only": messages.type.only,
        }),
        title: Joi.string().required().messages({
            "any.required": messages.title.required,
            "string.base": messages.title.required,
        }),
        message: Joi.string().required().messages({
            "any.required": messages.message.required,
            "string.base": messages.message.base,
        }),
        isRead: Joi.boolean().optional().messages({
            "boolean.base": messages.isRead.base
        })
    });
};
module.exports = {
    createNotificationSchema
};