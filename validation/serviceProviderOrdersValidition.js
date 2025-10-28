const Joi = require('joi');
const getMessages = require('../locales/schemaValiditionMessages/serviceProviderOrdersMessages');

const serviceWinchValidationSchema = (lang = 'en') => {
  const messages = getMessages(lang);

  return Joi.object({
    serviceType: Joi.string()
      .valid('winch')
      .required()
      .messages({
        'any.required': messages.serviceTypeRequired,
        'any.only': messages.serviceTypeInvalid,
        'string.base': messages.serviceTypeInvalid,
      }),
    userId: Joi.string()
      .required()
      .messages({
        'any.required': messages.userIdRequired,
        'string.base': messages.userIdRequired,
      }),
    image: Joi.string()
      .uri()
      .required()
      .messages({
        'any.required': messages.imageRequired,
        'string.uri': messages.imageInvalid,
        'string.base': messages.imageInvalid,
      }),

    details: Joi.string()
      .required()
      .messages({
        'any.required': messages.detailsRequired,
        'string.base': messages.detailsInvalid,
      }),

    location: Joi.object({
      lat: Joi.number().required().messages({
        'any.required': messages.locationLatRequired,
        'number.base': messages.locationLatInvalid,
      }),
      long: Joi.number().required().messages({
        'any.required': messages.locationLongRequired,
        'number.base': messages.locationLongInvalid,
      }),
    }).required().messages({
      'any.required': messages.locationRequired,
    }),
    locationText:Joi.string().required().messages({
      'any.required': messages.locationRequired,
    }),
    paymentType: Joi.string()
      .valid('cash', 'mada', 'bank')
      .required()
      .messages({
        'any.required': messages.paymentTypeRequired,
        'any.only': messages.paymentTypeInvalid,
      }),
    dropoffLocation: Joi.object({
      lat: Joi.number().required().messages({
        'any.required': messages.dropoffLatRequired,
        'number.base': messages.dropoffLatInvalid,
      }),
      long: Joi.number().required().messages({
        'any.required': messages.dropoffLongRequired,
        'number.base': messages.dropoffLongInvalid,
      }),
    }).required().messages({
      'any.required': messages.dropoffLocationRequired,
    }),
    dropoffLocationText:Joi.string().required().message({
      'any.required': messages.dropoffLocationRequired,
    }),
  });
};
const serviceTireValidationSchema = (lang = 'en') => {
  const messages = getMessages(lang);

  return Joi.object({
    serviceType: Joi.string()
      .valid('tire Filling', 'battery Jumpstart')
      .required()
      .messages({
        'any.required': messages.serviceTypeRequired,
        'any.only': messages.serviceTypeInvalid,
        'string.base': messages.serviceTypeInvalid,
      }),
    userId: Joi.string()
      .required()
      .messages({
        'any.required': messages.userIdRequired,
        'string.base': messages.userIdRequired,
      }),


    image: Joi.string()
      .uri()
      .required()
      .messages({
        'any.required': messages.imageRequired,
        'string.uri': messages.imageInvalid,
        'string.base': messages.imageInvalid,
      }),

    details: Joi.string()
      .required()
      .messages({
        'any.required': messages.detailsRequired,
        'string.base': messages.detailsInvalid,
      }),

    location: Joi.object({
      lat: Joi.number().required().messages({
        'any.required': messages.locationLatRequired,
        'number.base': messages.locationLatInvalid,
      }),
      long: Joi.number().required().messages({
        'any.required': messages.locationLongRequired,
        'number.base': messages.locationLongInvalid,
      }),
    }).required().messages({
      'any.required': messages.locationRequired,
    }),
    locationText:Joi.string().required().messages({
      'any.required': messages.locationRequired,
    }),
    paymentType: Joi.string()
      .valid('cash', 'mada', 'bank')
      .required()
      .messages({
        'any.required': messages.paymentTypeRequired,
        'any.only': messages.paymentTypeInvalid,
      }),
  });
};

module.exports = { serviceWinchValidationSchema, serviceTireValidationSchema };
