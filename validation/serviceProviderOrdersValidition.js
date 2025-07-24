const Joi = require('joi');
const getMessages= require('../locales/schemaValiditionMessages/serviceProviderOrdersMessages');

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

    paymentType: Joi.string()
      .valid('cash', 'card', 'online')
      .required()
      .messages({
        'any.required': messages.paymentTypeRequired,
        'any.only': messages.paymentTypeInvalid,
      }),

    carLocation: Joi.object({
      lat: Joi.number().required().messages({
        'any.required': messages.carLatRequired,
        'number.base': messages.carLatInvalid,
      }),
      long: Joi.number().required().messages({
        'any.required': messages.carLongRequired,
        'number.base': messages.carLongInvalid,
      }),
    }).required().messages({
      'any.required': messages.carLocationRequired,
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

    paymentType: Joi.string()
      .valid('cash', 'card', 'online')
      .required()
      .messages({
        'any.required': messages.paymentTypeRequired,
        'any.only': messages.paymentTypeInvalid,
      }),
  });
};

module.exports = { serviceWinchValidationSchema,serviceTireValidationSchema };
