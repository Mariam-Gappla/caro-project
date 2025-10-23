const Joi = require("joi");
const getMessages = require("../locales/schemaValiditionMessages/carValiditionMessages");
const carPostSchema = (lang = "en") => {
  const t = getMessages(lang);

  return Joi.object({
    title: Joi.string().required().messages({
      "any.required": t.titleRequired,
      "string.base": t.titleMustBeString
    }),
    nameId: Joi.string().required().messages({
      "any.required": t.nameIdRequired,
    }),
    modelId: Joi.string().required().messages({
      "any.required": t.modelIdRequired,
    }),
    images: Joi.array().items(Joi.string()).optional(),

    carTypeId: Joi.string().required().messages({
      "any.required": t.carTypeIdRequired,
    }),

    cityId: Joi.string().required().messages({
      "any.required": t.cityRequired,
    }),

    carPrice: Joi.number().required().messages({
      "any.required": t.carPriceRequired,
      "number.base": t.carPriceInvalid,
    }),

    priceAfterAuction: Joi.number().optional().messages({
      "number.base": t.priceAfterAuctionInvalid,
    }),

    videoCar: Joi.string().optional(),
    notes: Joi.string().allow("").optional(),

    isFixedPrice: Joi.boolean().default(false),
    ownershipFeesIncluded: Joi.boolean().default(false),
    priceLimit: Joi.number().when("isFixedPrice", {
      is: false,
      then: Joi.required().messages({
        "any.required": t.priceLimitRequired
      }),
      otherwise: Joi.optional()
    }),
    odeoMeter: Joi.string().required().messages({
      "any.required": t.odeoMeterRequired,
    }),

    carConditionId: Joi.string().required().messages({
      "any.required": t.isNewRequired,
    }),

    auctionStart: Joi.date().when("isFixedPrice", {
      is: false,
      then: Joi.required().messages({
        "any.required": t.auctionStartRequired,
      }),
      otherwise: Joi.optional(),
    }),

    auctionEnd: Joi.date().when("isFixedPrice", {
      is: false,
      then: Joi.required().messages({
        "any.required": t.auctionEndRequired,
      }),
      otherwise: Joi.optional(),
    }),

    phoneNumber: Joi.string().required().messages({
      "any.required": t.phoneNumberRequired,
    }),

    createdAt: Joi.date().optional(),
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
module.exports = carPostSchema;
