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
    paymentMethod: Joi.string().required().messages({
      "any.required": msg.paymentMethod.required,
      "any.only": msg.paymentMethod.valid
    }),
    pickupLocation: Joi.object({
      lat: Joi.number().required().messages({
        'number.base': msg.pickupLocation.lat
      }),
      long: Joi.number().required().messages({
        'number.base': msg.pickupLocation.long,
      }),
    }).required().messages({
      'object.base': msg.pickupLocation.base,
    }),
    deliveryType: Joi.string().valid("branch", "delivery").required().messages({
      "any.required": msg.deliveryType.required,
      "any.only": msg.deliveryType.valid
    }),
    totalAmount: Joi.number().required().messages({
      "any.required": msg.totalAmount.required,
      "number.base": msg.totalAmount.number
    }),
  });
};


module.exports = rentalOfficeOrderSchema;
