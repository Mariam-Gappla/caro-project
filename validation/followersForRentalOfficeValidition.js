const Joi = require('joi');
const followerSchemaValidation = Joi.object({
  userId: Joi.string().required().messages({
    'string.base': 'معرف المستخدم يجب أن يكون نصًا',
    'any.required': 'معرف المستخدم مطلوب'
  }),

  rentalOfficeId: Joi.string().required().messages({
    'string.base': 'معرف مكتب التأجير يجب أن يكون نصًا',
    'any.required': 'معرف مكتب التأجير مطلوب'
  }),

  followedAt: Joi.date().optional().messages({
    'date.base': 'تاريخ المتابعة يجب أن يكون تاريخًا صالحًا'
  })
});
module.exports={
 followerSchemaValidation   
}