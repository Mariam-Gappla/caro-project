const joi = require('joi');
const registerSchema = joi.object({
  username: joi.string().min(3).max(30).required().messages({
    'string.empty': "اسم المستخدم مطلوب",
    'any.required': "اسم المستخدم مطلوب",
    "string.min": "يجب أن يكون اسم المستخدم على الأقل 3 أحرف وعلى الأكثر 30 حرفًا",
    "string.max": "يجب أن يكون اسم المستخدم على الأقل 3 أحرف وعلى الأكثر 30 حرفًا"
  }),

  email: joi.string().email({ tlds: { allow: false } }).required().messages({
    'string.empty': "البريد الإلكتروني مطلوب",
    'any.required': "البريد الإلكتروني مطلوب",
    'string.email': "يجب أن يكون البريد الإلكتروني بالصيغة example@gmail.com"
  }),

  password:joi.string().min(3).max(30).required().messages({
    'string.empty': 'كلمة المرور مطلوبة',
    'string.min': 'كلمة المرور يجب أن تكون 3 أحرف على الأقل',
    'string.max': 'كلمة المرور يجب ألا تتجاوز 30 حرفًا',
    'any.required': 'كلمة المرور مطلوبة'
  }),

  confirmPassword: joi.any().valid(joi.ref('password')).required().messages({
    'any.only': "كلمة المرور وتأكيدها غير متطابقين",
    'any.required': "تأكيد كلمة المرور مطلوب"
  }),

  role: joi.string()
  .valid("rentalOffice", "serviceProvider", "user")
  .required()
  .messages({
    'any.only': "الدور يجب أن يكون إما rentalOffice أو serviceProvider أو user",
    'string.empty': "الدور مطلوب",
    'any.required': "الدور مطلوب"
  })
});
const loginSchema = joi.object({
  email: joi.string().email().required().messages({
    'string.empty': 'البريد الإلكتروني مطلوب',
    'string.email': 'صيغة البريد الإلكتروني غير صحيحة',
    'any.required': 'البريد الإلكتروني مطلوب'
  }),
  password: joi.string().min(3).max(30).required().messages({
    'string.empty': 'كلمة المرور مطلوبة',
    'string.min': 'كلمة المرور يجب أن تكون 3 أحرف على الأقل',
    'string.max': 'كلمة المرور يجب ألا تتجاوز 30 حرفًا',
    'any.required': 'كلمة المرور مطلوبة'
  }),
  role: joi.string()
  .valid("rentalOffice", "serviceProvider", "user")
  .required()
  .messages({
    'any.only': "الدور يجب أن يكون إما rentalOffice أو serviceProvider أو user",
    'string.empty': "الدور مطلوب",
    'any.required': "الدور مطلوب"
  })
});
module.exports={
    registerSchema,
    loginSchema
}
