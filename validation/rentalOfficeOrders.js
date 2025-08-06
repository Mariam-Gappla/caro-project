const Joi = require('joi');
const getMessages = require("../locales/schemaValiditionMessages/rentalOfficeOrdersValiditionMessages");
const rentalOfficeOrderSchema = (lang = "en") => {
  const msg = getMessages(lang);

  return Joi.object({
    userId: Joi.string().required().messages({
      "any.required": msg.userId.required
    }),

    carId: Joi.string().required().messages({
      "any.required": msg.carId.required
    }),

    startDate: Joi.date().required().messages({
      "any.required": msg.startDate.required,
      "date.base": msg.startDate.date
    }),

    endDate: Joi.date().required().messages({
      "any.required": msg.endDate.required,
      "date.base": msg.endDate.date
    }),

    paymentMethod: Joi.string().valid("cash","online").required().messages({
      "any.required": msg.paymentMethod.required,
      "any.only": msg.paymentMethod.valid
    }),

    priceType: Joi.string()
      .valid('open_km', 'limited_km')
      .required()
      .messages({
        "any.required": msg.priceType.required,
        "string.base": msg.priceType.base,
        "any.only": msg.priceType.only
      }),

    totalCost: Joi.number().required().messages({
      "any.required": msg.totalCost.base,
      "number.base": msg.totalCost.required
    }),

    deliveryType: Joi.string().valid("branch", "delivery").required().messages({
      "any.required": msg.deliveryType.required,
      "any.only": msg.deliveryType.valid
    }),

    pickupLocation: Joi.when("deliveryType", {
      is: "delivery",
      then: Joi.object({
        lat: Joi.number().required().messages({
          'number.base': msg.pickupLocation.lat,
          'any.required': msg.pickupLocation.requiredLat,
        }),
        long: Joi.number().required().messages({
          'number.base': msg.pickupLocation.long,
          'any.required': msg.pickupLocation.requiredLong,
        }),
      }).required().messages({
        'object.base': msg.pickupLocation.base,
      }),
      otherwise: Joi.forbidden() // ❌ يمنع إرسال location لو مش توصيل
    }),
  });
};

const rentToOwnOrderSchema = (lang = "en") => {
  const msg = getMessages(lang);

  return Joi.object({
    userId: Joi.string().required().messages({
      "any.required": msg.userId.required
    }),

    carId: Joi.string().required().messages({
      "any.required": msg.carId.required
    }),

    startDate: Joi.date().required().messages({
      "any.required": msg.startDate.required,
      "date.base": msg.startDate.date
    }),

    paymentMethod: Joi.string().required().messages({
      "any.required": msg.paymentMethod.required,
      "any.only": msg.paymentMethod.valid
    }),

    totalCost: Joi.number().required().messages({
      "any.required": msg.totalCost.base,
      "number.base": msg.totalCost.required
    }),

    deliveryType: Joi.string().valid("branch", "delivery").required().messages({
      "any.required": msg.deliveryType.required,
      "any.only": msg.deliveryType.valid
    }),

    pickupLocation: Joi.when("deliveryType", {
      is: "delivery",
      then: Joi.object({
        lat: Joi.number().required().messages({
          'number.base': msg.pickupLocation.lat,
          'any.required': msg.pickupLocation.requiredLat,
        }),
        long: Joi.number().required().messages({
          'number.base': msg.pickupLocation.long,
          'any.required': msg.pickupLocation.requiredLong,
        }),
      }).required().messages({
        'object.base': msg.pickupLocation.base,
      }),
      otherwise: Joi.forbidden() // ❌ يمنع إرسال pickupLocation لو مش توصيل
    }),
  });
};




module.exports = {
  rentalOfficeOrderSchema,
  rentToOwnOrderSchema
};
