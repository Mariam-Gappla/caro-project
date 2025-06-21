const Joi = require('joi');
const getMessages = require("../locales/schemaValiditionMessages/carRentalValiditionMessages");
const getupdateMessages = require("../locales/schemaValiditionMessages/updateCarRentalValidationMessages");
const getRentToOwnMessages=require("../locales/schemaValiditionMessages/rentToOwnValiditionMessages");
const carRentalWeeklyValiditionSchema = (lang = "en") => {
  const messages = getMessages(lang)
  return Joi.object({
    rentalType: Joi.string()
      .valid("weekly/daily", "rent to own")
      .required()
      .messages({
        'any.required': messages.rentalType.required,
        'any.only': messages.rentalType.valid,
        'string.base': messages.rentalType.string
      }),

    images: Joi.array().items(Joi.string().uri().messages({
      'string.uri': messages.images.uri
    })).messages({
      'array.base': messages.images.base
    }),

    carName: Joi.string().required().messages({
      'string.base': messages.carName.string,
      'any.required': messages.carName.required
    }),

    carType: Joi.string().required().messages({
      'string.base': messages.carType.string,
      'any.required': messages.carType.required
    }),

    carModel: Joi.number().required().messages({
      'number.base': messages.carModel.number,
      'any.required': messages.carModel.required
    }),

    licensePlateNumber: Joi.string().required().messages({
      'string.base': messages.licensePlateNumber.string,
      'any.required': messages.licensePlateNumber.required
    }),

    freeKilometers: Joi.number().required().messages({
      'number.base': messages.freeKilometers.number,
      'any.required': messages.freeKilometers.required
    }),

    pricePerFreeKilometer: Joi.number().required().messages({
      'number.base': messages.pricePerFreeKilometer.number,
      'any.required': messages.pricePerFreeKilometer.required
    }),

    pricePerExtraKilometer: Joi.number().required().messages({
      'number.base': messages.pricePerExtraKilometer.number,
      'any.required': messages.pricePerExtraKilometer.required
    }),

    city: Joi.string().required().messages({
      'string.base': messages.city.string,
      'any.required': messages.city.required
    }),

    area: Joi.string().required().messages({
      'string.base': messages.area.string,
      'any.required': messages.area.required
    }),

    carDescription: Joi.string().required().messages({
      'string.base': messages.carDescription.string,
      'any.required': messages.carDescription.required
    }),

    deliveryOption: Joi.boolean().messages({
      'boolean.base': messages.deliveryOption.boolean
    })
  });
}
const rentToOwnSchema = (lang = "en") => {
  const messages = getRentToOwnMessages(lang);

  return Joi.object({
    rentalType: Joi.string()
      .valid("weekly/daily", "rent to own")
      .required()
      .messages({
        'any.required': messages.rentalType.required,
        'any.only': messages.rentalType.only,
        'string.base': messages.rentalType.string
      }),

    images: Joi.array().items(
      Joi.string().uri().messages({
        'string.uri': messages.images.uri
      })
    ).messages({
      'array.base': messages.images.base
    }),

    carName: Joi.string().required().messages({
      'string.base': messages.carName.string,
      'any.required': messages.carName.required
    }),

    carType: Joi.string().required().messages({
      'string.base': messages.carType.string,
      'any.required': messages.carType.required
    }),

    carModel: Joi.number().required().messages({
      'number.base': messages.carModel.number,
      'any.required': messages.carModel.required
    }),

    licensePlateNumber: Joi.string().required().messages({
      'string.base': messages.licensePlateNumber.string,
      'any.required': messages.licensePlateNumber.required
    }),

    totalKilometers: Joi.number().required().messages({
      'number.base': messages.totalKilometers.number,
      'any.required': messages.totalKilometers.required
    }),

    carPrice: Joi.number().required().messages({
      'number.base': messages.carPrice.number,
      'any.required': messages.carPrice.required
    }),

    monthlyPayment: Joi.number().required().messages({
      'number.base': messages.monthlyPayment.number,
      'any.required': messages.monthlyPayment.required
    }),

    finalPayment: Joi.number().required().messages({
      'number.base': messages.finalPayment.number,
      'any.required': messages.finalPayment.required
    }),

    city: Joi.string().required().messages({
      'string.base': messages.city.string,
      'any.required': messages.city.required
    }),

    area: Joi.string().required().messages({
      'string.base': messages.area.string,
      'any.required': messages.area.required
    }),

    carDescription: Joi.string().required().messages({
      'string.base': messages.carDescription.string,
      'any.required': messages.carDescription.required
    }),

    deliveryOption: Joi.boolean().messages({
      'boolean.base': messages.deliveryOption.boolean
    })
  });
};


module.exports = {
  carRentalWeeklyValiditionSchema,
  rentToOwnSchema
}