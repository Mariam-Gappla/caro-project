const Joi = require('joi');
const commentValidationSchema = Joi.object({
  content: Joi.string()
    .min(1)
    .max(500)
    .required()
    .messages({
      'string.base': 'التعليق يجب أن يكون نصًا',
      'string.empty': 'التعليق لا يمكن أن يكون فارغًا',
      'string.min': 'التعليق يجب أن يحتوي على حرف واحد على الأقل',
      'string.max': 'التعليق لا يمكن أن يزيد عن 500 حرف',
      'any.required': 'التعليق مطلوب'
    }),
    tweetId: Joi.string()
    .required()
    .messages({
      'any.required': 'معرّف التويت مطلوب',
      'string.base': 'معرّف التويت يجب أن يكون نصًا'
    })
});

module.exports = { commentValidationSchema };
