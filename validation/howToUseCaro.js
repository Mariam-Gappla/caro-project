const Joi = require('joi');
const getMessages = require('../locales/schemaValiditionMessages/howToUseCaro');

const getHowToUseCaroSchema = (lang = 'en') => {
  const t = getMessages(lang);

  return Joi.object({
    videos: Joi.array()
      .items(
        Joi.object({
          url: Joi.string().uri().required().messages({
            'string.base': t.urlInvalid,
            'string.uri': t.urlInvalid,
            'any.required': t.urlRequired
          })
        })
      )
      .length(3)
      .required()
      .messages({
        'any.required': t.required,
        'array.length': t.length
      })
  });
};

module.exports = getHowToUseCaroSchema;
