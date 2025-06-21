const Joi = require('joi');
const getMessages=require("../locales/schemaValiditionMessages/commentsValiditionMessages")
const commentValidationSchema = (lang='en')=>{
  const messages=getMessages(lang);
  return Joi.object({
  content: Joi.string()
    .min(1)
    .max(500)
    .required()
    .messages({
      'string.base': messages.content.base,
      'string.empty': messages.content.empty,
      'string.min': messages.content.min,
      'string.max': messages.content.max,
      'any.required': messages.content.required
    }),
    tweetId: Joi.string()
    .required()
    .messages({
      'any.required': messages.tweetId.base,
      'string.base': messages.tweetId.required
    })
});
}

module.exports = { commentValidationSchema };
