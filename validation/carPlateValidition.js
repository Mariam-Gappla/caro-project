// validations/carValidation.js
const Joi = require("joi");
const getMessages = require("../locales/schemaValiditionMessages/carPlateValiditionMessages");

const carPlatePostSchema = (lang = "en") => {
  const t = getMessages(lang);

  return Joi.object({
    plateNumber: Joi.string().required().messages({
      "any.required": t.plateNumberRequired
    }),
    plateLetters: Joi.string().required().messages({
      "any.required": t.plateLettersRequired
    }),
    cityId: Joi.string().required().messages({
      "any.required": t.cityRequired
    }),
    notes: Joi.string().allow(""),
    ownershipFeesIncluded: Joi.boolean().default(false),
    isFixedPrice: Joi.boolean().default(false),

    // 🟢 السعر لازم يكون موجود
    price: Joi.number().required().messages({
      "any.required": t.priceRequired
    }),

    auctionStart: Joi.date().when("isFixedPrice", {
      is: false,
      then: Joi.required().messages({
        "any.required": t.auctionStartRequired
      }),
      otherwise: Joi.optional()
    }),
    auctionEnd: Joi.date().when("isFixedPrice", {
      is: false,
      then: Joi.required().messages({
        "any.required": t.auctionEndRequired
      }),
      otherwise: Joi.optional()
    }),

    phoneNumber: Joi.string().required().messages({
      "any.required": t.phoneNumberRequired
    }),

    // 🟢 وقت الإنشاء ييجي من السيرفر
    createdAt: Joi.date().optional()
  })
    .custom((obj, helpers) => {
      if (obj.isFixedPrice === false && obj.auctionStart && obj.auctionEnd) {
        if (new Date(obj.auctionEnd) <= new Date(obj.auctionStart)) {
          return helpers.error("auctionEnd.lessThanStart");
        }
      }

      // 🟢 التحقق من أن auctionStart = createdAt
      if (obj.isFixedPrice === false && obj.auctionStart && obj.createdAt) {
        if (new Date(obj.auctionStart).getTime() !== new Date(obj.createdAt).getTime()) {
          return helpers.error("auctionStart.notEqualCreatedAt");
        }
      }

      return obj;
    })
    .messages({
      "auctionEnd.lessThanStart": t.auctionEndGreater,
      "auctionStart.notEqualCreatedAt": t.auctionStartEqualCreatedAt
    });
};

module.exports = carPlatePostSchema;
