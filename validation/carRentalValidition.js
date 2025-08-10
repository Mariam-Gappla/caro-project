const Joi = require('joi');
const getMessages = require("../locales/schemaValiditionMessages/carRentalValiditionMessages");
const getupdateMessages = require("../locales/schemaValiditionMessages/updateCarRentalValidationMessages");
const getRentToOwnMessages = require("../locales/schemaValiditionMessages/rentToOwnValiditionMessages");
const carRentalWeeklyValiditionSchema = (lang = "en") => {
  const messages = getMessages(lang)
  return Joi.object({
    rentalType: Joi.string()
      .valid("weekly/daily")
      .required()
      .messages({
        'any.required': messages.rentalType.required,
        'any.only': messages.rentalType.only,
        'string.base': messages.rentalType.string
      }),
    images: Joi.array().items(Joi.string().uri().messages({
      'string.uri': messages.images.uri
    })).messages({
      'array.base': messages.images.base
    }),
    carTypeId: Joi.string().required().messages({
      'string.base': messages.carType.string,
      'any.required': messages.carType.required
    }),
    licensePlateNumber: Joi.string().required().messages({
      'string.base': messages.licensePlateNumber.string,
      'any.required': messages.licensePlateNumber.required
    }),

    freeKilometers: Joi.number().required().messages({
      'number.base': messages.freeKilometers.number,
      'any.required': messages.freeKilometers.required
    }),
    odoMeter: Joi.number().required().messages({
      'number.base': messages.odoMeter.number,
      'any.required': messages.odoMeter.required
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
    }),
     nameId: Joi.string().required().messages({
      "any.required": messages.nameId.required,
      "string.base": messages.nameId.string,
    }),
    modelId: Joi.string().required().messages({
      "any.required": messages.modelId.required,
      "string.base": messages.modelId.string,
    })
  });
}
const rentToOwnSchema = (lang = "en") => {
  const messages = getRentToOwnMessages(lang);

  return Joi.object({
    rentalType: Joi.string()
      .valid("rent to own")
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
    ownershipPeriod: Joi.string()
      .required()
      .messages({
        'any.required': messages.ownershipPeriod.required,
        'string.base': messages.ownershipPeriod.base
      }),

   carTypeId: Joi.string().required().messages({
      'string.base': messages.carType.string,
      'any.required': messages.carType.required
    }),
    licensePlateNumber: Joi.string().required().messages({
      'string.base': messages.licensePlateNumber.string,
      'any.required': messages.licensePlateNumber.required
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
    odoMeter: Joi.number().required().messages({
      'number.base': messages.odoMeter.number,
      'any.required': messages.odoMeter.required
    }),
    deliveryOption: Joi.boolean().messages({
      'boolean.base': messages.deliveryOption.boolean
    }),
     nameId: Joi.string().required().messages({
      "any.required": messages.nameId.required,
      "string.base": messages.nameId.string,
    }),
    modelId: Joi.string().required().messages({
      "any.required": messages.modelId.required,
      "string.base": messages.modelId.string,
    })
    
  });
 
};
const carRentalWeeklyValiditionUpdateSchema = (lang = "en") => {
  const messages = getMessages(lang)
  return Joi.object({
    rentalType: Joi.string()
      .valid("weekly/daily")
      .optional()
      .messages({
        'any.only': messages.rentalType.only,
        'string.base': messages.rentalType.string
      }),

    images: Joi.array().items(Joi.string().uri().messages({
      'string.uri': messages.images.uri
    })).messages({
      'array.base': messages.images.base
    }),

    carTypeId: Joi.string().optional().messages({
      'string.base': messages.carType.string,
    }),
    
    licensePlateNumber: Joi.string().optional().messages({
      'string.base': messages.licensePlateNumber.string,
    }),

    freeKilometers: Joi.number().optional().messages({
      'number.base': messages.freeKilometers.number,
    }),
    odoMeter: Joi.number().optional().messages({
      'number.base': messages.odoMeter.number,
    }),
    pricePerFreeKilometer: Joi.number().optional().messages({
      'number.base': messages.pricePerFreeKilometer.number,
    }),

    pricePerExtraKilometer: Joi.number().optional().messages({
      'number.base': messages.pricePerExtraKilometer.number,
    }),

    city: Joi.string().optional().messages({
      'string.base': messages.city.string,
    }),

    area: Joi.string().optional().messages({
      'string.base': messages.area.string,
    }),

    carDescription: Joi.string().optional().messages({
      'string.base': messages.carDescription.string,
    }),

    deliveryOption: Joi.boolean().messages({
      'boolean.base': messages.deliveryOption.boolean
    }),
    imagesToDelete: Joi
      .optional()
      .messages({
        'array.base': 'imagesToDelete يجب أن تكون قائمة.',
        'string.uri': 'كل عنصر في imagesToDelete يجب أن يكون رابطًا صحيحًا.'
      }),
       nameId: Joi.string().required().messages({
      "any.required": messages.nameId.required,
      "string.base": messages.nameId.string,
    }),
    modelId: Joi.string().required().messages({
      "any.required": messages.modelId.required,
      "string.base": messages.modelId.string,
    })
  });
}
const rentToOwnUpdateSchema = (lang = "en") => {
  const messages = getRentToOwnMessages(lang);

  return Joi.object({
    rentalType: Joi.string()
      .valid("rent to own")
      .optional()
      .messages({
        'string.base': messages.rentalType.string
      }),

    images: Joi.array().items(
      Joi.string().uri().messages({
        'string.uri': messages.images.uri
      })
    ).messages({
      'array.base': messages.images.base
    }),
    ownershipPeriod: Joi.string()
      .optional()
      .messages({
        'string.base': messages.ownershipPeriod.base
      }),
    carTypeId: Joi.string().optional().messages({
      'string.base': messages.carType.string,
    }),
    licensePlateNumber: Joi.string().optional().messages({
      'string.base': messages.licensePlateNumber.string,
    }),
    carPrice: Joi.number().optional().messages({
      'number.base': messages.carPrice.number,
    }),

    monthlyPayment: Joi.number().optional().messages({
      'number.base': messages.monthlyPayment.number,
    }),

    finalPayment: Joi.number().optional().messages({
      'number.base': messages.finalPayment.number,
    }),

    city: Joi.string().optional().messages({
      'string.base': messages.city.string,
    }),

    area: Joi.string().optional().messages({
      'string.base': messages.area.string,
    }),

    carDescription: Joi.string().optional().messages({
      'string.base': messages.carDescription.string,
    }),
    odoMeter: Joi.number().optional().messages({
      'number.base': messages.odoMeter.number,
    }),
    deliveryOption: Joi.boolean().messages({
      'boolean.base': messages.deliveryOption.boolean
    }),
    imagesToDelete: Joi
      .optional()
      .messages({
        'array.base': messages.imagesToDelete.base,
        'string.uri': messages.imagesToDelete.uri
      }),
      nameId: Joi.string().required().messages({
      "any.required": messages.nameId.required,
      "string.base": messages.nameId.string,
    }),
    modelId: Joi.string().required().messages({
      "any.required": messages.modelId.required,
      "string.base": messages.modelId.string,
    })
  });
};

module.exports = {
  carRentalWeeklyValiditionSchema,
  rentToOwnSchema,
  carRentalWeeklyValiditionUpdateSchema,
  rentToOwnUpdateSchema
}