const Joi = require('joi');
const getMessages=require("../locales/schemaValiditionMessages/commentForUserValiditionMessages")
const commentForUserValidationSchema = (lang='en')=>{
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
    postId: Joi.string()
    .required()
    .messages({
      'any.required': messages.postId.base,
      'string.base': messages.postId.required
    })
});
}

module.exports = { commentForUserValidationSchema };
