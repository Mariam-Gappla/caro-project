const Joi = require('joi');
const getMessages = require('../locales/schemaValiditionMessages/contactUsValiditionMessages');

const contactUsSchema = (lang = 'en') => {
  const messages = getMessages(lang);

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
    }),
    senderType: Joi.string().valid('user', 'serviceProvider', 'rentalOffice').required().messages({
      'any.required': m.senderType,
      'any.only': m.senderType,
      'string.empty': m.senderType
    }),
    senderId: Joi.string().required().messages({
      'any.required': m.senderId,
      'string.empty': m.senderId
    })
  });


};

module.exports = contactUsSchema;
