const Joi=require("joi");
const getMessages = require("../locales/schemaValiditionMessages/ratingValiditionMessages")

const ratingSchema = (lang = "en") => {
    const messages = getMessages(lang)
    return Joi.object({
        userId: Joi.string().required().messages(messages.userId),
        entityId: Joi.string().required().messages(messages.entityId),
        entityType: Joi.string()
            .valid("Post","Car","CarPlate")
            .required()
            .messages(messages.entityType),
        rating: Joi.number().min(1).max(5).required().messages(messages.rating),
        ques1: Joi.boolean().required().messages(messages.ques1),
        ques2: Joi.boolean().required().messages(messages.ques2),
        comment: Joi.string().allow("", null).messages(messages.comment),
    });
}
module.exports={
    ratingSchema
}
