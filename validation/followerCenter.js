const Joi = require('joi');
const getMessages = require("../locales/schemaValiditionMessages/followersForRentalOfficeValiditionMessages")
const followerCenterSchema = (lang = 'en') => {
    const messages = getMessages(lang);
    return Joi.object({
        centerId: Joi.string().required().messages({
            'string.base': messages.userId.base,
            'any.required': messages.userId.required
        }),

        followedAt: Joi.date().optional().messages({
            'date.base': messages.followedAt.base
        })
    });
}
module.exports = {
    followerCenterSchema
}