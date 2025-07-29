const joi = require('joi');
const getMessages = require("../locales/schemaValiditionMessages/userValiditionMessages")
const registerSchema = (lang = "en") => {
  const messages = getMessages(lang);
  return joi.object({
    username: joi.string().min(3).max(30).required().messages({
      'string.empty': messages.register.username.required,
      'any.required': messages.register.username.required,
      "string.min": messages.register.username.min,
      "string.max": messages.register.username.max
    }),

    email: joi.string().email().messages({
      'string.empty': messages.register.email.required,
      'string.email': messages.register.email.invalid
    }),
    phone:joi.string().min(3).required().messages({
      'string.empty': messages.register.password.required,
      'string.min': messages.register.password.min,
      'any.required': messages.register.password.required,
    }),
    password: joi.string().min(3).required().messages({
      'string.empty': messages.register.password.required,
      'string.min': messages.register.password.min,
      'any.required': messages.register.password.required,
    }),

    confirmPassword: joi.any().valid(joi.ref('password')).required().messages({
      'any.only': messages.register.confirmPassword.match,
      'any.required': messages.register.confirmPassword.required
    }),

    role: joi.string()
      .valid("rentalOffice", "serviceProvider", "user")
      .required()
      .messages({
        'any.only': messages.register.role.required,
        'string.empty': messages.register.role.required,
        'any.required': messages.register.role.valid
      })
  });
}
const loginSchema = (lang = "en") => {
  const messages = getMessages(lang);
  return joi.object({
    phone: joi.string().pattern(/^\d{10,15}$/).required().messages({
      'string.empty': messages.login.phone.required, // "رقم الهاتف مطلوب"
      'string.pattern.base': messages.login.phone.invalid, // "صيغة رقم الهاتف غير صحيحة"
      'any.required': messages.login.phone.required // "رقم الهاتف مطلوب"
    }),
    password: joi.string().min(3).max(30).required().messages({
      'string.empty': messages.login.password.required,
      'any.required': messages.login.password.required
    }),
    role: joi.string()
      .valid("rentalOffice", "serviceProvider", "user")
      .required()
      .messages({
        'any.only': messages.login.role.valid,
        'string.empty': messages.login.role.required,
        'any.required': messages.login.role.required
      })
  });
}
const registerProviderSchema=(lang="en")=>{
   const messages = getMessages(lang);
  return joi.object({
    username: joi.string().min(3).max(30).required().messages({
      "string.min": messages.register.username.min,
      "string.max": messages.register.username.max
    }),

    email: joi.string().email().messages({
      'string.email': messages.register.email.invalid
    }),
    phone:joi.string().min(3).required().messages({
      'string.empty': messages.register.password.required,
      'string.min': messages.register.password.min,
      'any.required': messages.register.password.required,
    }),
    password: joi.string().min(3).required().messages({
      'string.empty': messages.register.password.required,
      'string.min': messages.register.password.min,
      'any.required': messages.register.password.required,
    }),
    role: joi.string()
      .valid("rentalOffice", "serviceProvider", "user")
      .required()
      .messages({
        'any.only': messages.register.role.required,
        'string.empty': messages.register.role.required,
        'any.required': messages.register.role.valid
      })
  });
}
module.exports = {
  registerSchema,
  loginSchema,
  registerProviderSchema
}
