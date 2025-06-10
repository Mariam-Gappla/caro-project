const Joi = require('joi');
const tweetValidationSchema = Joi.object({
  content: Joi.string()
    .min(1)
    .max(280)
    .required()
    .messages({
      'string.base': 'المحتوى يجب أن يكون نصًا',
      'string.empty': 'المحتوى لا يمكن أن يكون فارغًا',
      'string.min': 'المحتوى يجب أن يحتوي على حرف واحد على الأقل',
      'string.max': 'المحتوى لا يمكن أن يزيد عن 280 حرف',
      'any.required': 'المحتوى مطلوب'
    })
});

module.exports = { tweetValidationSchema };
