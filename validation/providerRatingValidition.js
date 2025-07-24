const Joi = require('joi');
const getMessages = require('./ratingMessages');

const providerRatingSchema = (lang = 'en') => {
  const messages = getMessages(lang);

  return Joi.object({
    serviceProvider: Joi.string()
      .required()
      .messages({
        'any.required': messages.serviceProviderRequired,
        'string.base': messages.serviceProviderString,
      }),

    user: Joi.string()
      .required()
      .messages({
        'any.required': messages.userRequired,
        'string.base': messages.userString,
      }),

    rating: Joi.number()
      .min(1)
      .max(5)
      .required()
      .messages({
        'any.required': messages.ratingRequired,
        'number.base': messages.ratingNumber,
        'number.min': messages.ratingMin,
        'number.max': messages.ratingMax,
      }),

    comment: Joi.string()
      .allow('')
      .messages({
        'string.base': messages.commentString,
      }),

    orderId: Joi.string()
      .required()
      .messages({
        'any.required': messages.orderIdRequired,
        'string.base': messages.orderIdString,
      }),
  });
};

module.exports = providerRatingSchema;
