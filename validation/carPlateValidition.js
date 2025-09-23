// validations/carValidation.js
const Joi = require("joi");
const getMessages = require("../locales/schemaValiditionMessages/carPlateValiditionMessages");

const carPlatePostSchema = (lang = "en") => {
  const t = getMessages(lang);

  return Joi.object({
    plateNumber: Joi.string().required().messages({
      "any.required": t.plateNumberRequired
    }),
    digites: Joi.number()
      .valid(1, 2, 3, 4)
      .required()
      .messages({
        "any.required": t.digitesRequired,
        "any.only": t.digitesInvalid
      }),
    // 🟢 متوافق مع schema (object en/ar)
    plateLetters: Joi.object({
      en: Joi.string().required().messages({
        "any.required": t.plateLettersRequired
      }),
      ar: Joi.string().required().messages({
        "any.required": t.plateLettersRequired
      })
    }).required(),

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

    priceAfterAuction: Joi.number().optional(),

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
    plateType: Joi.string()
      .valid("private", "commercial")
      .required()
      .messages({
        "any.required": t.plateTypeRequired,
        "any.only": t.plateTypeInvalid
      }),
    phoneNumber: Joi.string().required().messages({
      "any.required": t.phoneNumberRequired
    }),

    // 🟢 يجي من السيرفر مش من اليوزر
    createdAt: Joi.date().optional()
  })
    .custom((obj, helpers) => {
      if (obj.isFixedPrice === false && obj.auctionStart && obj.createdAt) {
        const start = new Date(obj.auctionStart);
        const created = new Date(obj.createdAt);

        const sameDate =
          start.getFullYear() === created.getFullYear() &&
          start.getMonth() === created.getMonth() &&
          start.getDate() === created.getDate();

        if (!sameDate) {
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
