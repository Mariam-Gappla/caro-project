const Joi = require("joi");
const getMessages = require("../locales/schemaValiditionMessages/postValiditionMessages");

const postSchema = (lang = "en") => {
  const messages = getMessages(lang);

  return Joi.object({
    title: Joi.string().required().messages({
      "string.empty": messages.title,
      "any.required": messages.title
    }),
    description: Joi.string().required().messages({
      "string.empty": messages.description,
      "any.required": messages.description
    }),
    mainCategoryId: Joi.string().required().messages({
      "string.empty": messages.mainCategoryId,
      "any.required": messages.mainCategoryId
    }),
    subCategoryId: Joi.string().required().messages({
      "string.empty": messages.subCategoryId,
      "any.required": messages.subCategoryId
    }),
    userId: Joi.string().required().messages({
      "string.empty": messages.userId,
      "any.required": messages.userId
    }),
    location: Joi.object({
      lat: Joi.number().required().messages({
        "number.base": messages.location.lat,
        "any.required": messages.location.lat
      }),
      long: Joi.number().required().messages({
        "number.base": messages.location.long,
        "any.required": messages.location.long
      })
    }).required(),
    priceType: Joi.string().valid("fixed", "negotiable", "best").required().messages({
      "any.only": messages.priceType.only,
      "any.required": messages.priceType.required,
      "string.empty": messages.priceType.required
    }),
    // ✅ price مربوط بـ priceType
    price: Joi.number().when("priceType", {
      is: Joi.valid("fixed", "negotiable"),
      then: Joi.required().messages({
        "number.base": messages.price,
        "any.required": messages.price
      }),
      otherwise: Joi.optional()
    }),
    contactType: {
      type: [String], // Array of strings
      enum: ["whatsapp", "call", "inAppChat"],
      required: true,
    },
    deposit: Joi.number().required().messages({
      "number.base": messages.deposit,
      "any.required": messages.deposit
    }),
    cityId: Joi.string().required().messages({
      'string.base': messages.city.string,
      'any.required': messages.city.required
    }),
    areaId: Joi.string().required().messages({
      'string.base': messages.area.string,
      'any.required': messages.area.required
    }),
    contactType: Joi.array()
      .items(Joi.string().valid("whatsapp", "call", "inAppChat"))
      .min(1)
      .required()
      .messages({
        "array.base": messages.contactType.base,
        "any.required": messages.contactType.required,
        "array.includes": messages.contactType.only,
      }),

    // ✅ contactValue مربوط بـ contactType
    contactValue: Joi.string()
      .when("contactType", {
        is: Joi.array().items(Joi.valid("whatsapp", "call")).has(Joi.valid("whatsapp", "call")),
        then: Joi.required(),
        otherwise: Joi.forbidden(),
      })
      .messages({
        "string.base": messages.contactValue.base,
        "any.required": messages.contactValue.required,
        "any.unknown": messages.contactValue.unknown,
      }),
  });
};

module.exports = postSchema;
