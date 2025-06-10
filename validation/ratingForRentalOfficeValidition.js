const Joi = require('joi');
const ratingSchemaValidation = Joi.object({
  userId: Joi.string().required().messages({
    'string.base': 'معرف المستخدم يجب أن يكون نصًا',
    'any.required': 'معرف المستخدم مطلوب'
  }),

  rentalOfficeId: Joi.string().required().messages({
    'string.base': 'معرف مكتب التأجير يجب أن يكون نصًا',
    'any.required': 'معرف مكتب التأجير مطلوب'
  }),

  rating: Joi.number().min(1).max(5).required().messages({
    'number.base': 'التقييم يجب أن يكون رقمًا',
    'number.min': 'أقل تقييم مسموح هو 1',
    'number.max': 'أعلى تقييم مسموح هو 5',
    'any.required': 'قيمة التقييم مطلوبة'
  })
});

module.exports={
   ratingSchemaValidation
}
