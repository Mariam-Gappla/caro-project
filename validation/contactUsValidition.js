const Joi = require('joi');
const getMessages = require('../locales/schemaValiditionMessages/contactUsValiditionMessages');

const contactUsSchema = (lang = 'en') => {
  const m = getMessages(lang);

    return Joi.object({
    name: Joi.string().required().messages({
      'any.required': m.name,
      'string.empty': m.name
    }),
    phone: Joi.string().required().messages({
      'any.required': m.phone,
      'string.empty': m.phone
    }),
    message: Joi.string().required().messages({
      'any.required': m.message,
      'string.empty': m.message
    })
  });


};

module.exports = contactUsSchema;
