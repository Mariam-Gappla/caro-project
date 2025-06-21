const Joi = require('joi');
const getMessages = require('../locales/schemaValiditionMessages/contactUsValiditionMessages');

const contactUsSchema = (lang = 'en') => {
  const messages = getMessages(lang);

  return Joi.object({
    name: Joi.string().min(2).max(100).required().messages({
      'string.empty': messages.name.required,
      'string.min': messages.name.min,
      'string.max': messages.name.max,
      'any.required': messages.name.required,
    }),
    phone: Joi.string().min(6).max(20).required().messages({
      'string.empty': messages.phone.required,
      'string.min': messages.phone.min,
      'string.max': messages.phone.max,
      'any.required': messages.phone.required,
    }),
    message: Joi.string().min(5).required().messages({
      'string.empty': messages.message.required,
      'string.min': messages.message.min,
      'any.required': messages.message.required,
    }),
  });
};

module.exports = {contactUsSchema};
