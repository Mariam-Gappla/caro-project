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
      type: Joi.string().valid("Point").required().messages({
        "any.only": messages.location.locationType, // لازم يكون Point
        "any.required": messages.location.locationType,
      }),
      coordinates: Joi.array()
        .items(
          Joi.number().required().messages({
            "number.base": messages.location.coordinateNumber,
            "any.required": messages.location.coordinateNumber,
          })
        )
        .length(2) // [lng, lat]
        .required()
        .messages({
          "array.length": messages.location.coordinatesLength,
          "any.required": messages.location.coordinatesRequired,
        }),
    }).required().messages({
      "any.required": messages.location.locationRequired,
    }),
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
        otherwise: Joi.string().optional(),
      })
      .messages({
        "string.base": messages.contactValue.base,
        "any.required": messages.contactValue.required,
        "any.unknown": messages.contactValue.unknown,
      }),
  });
};

module.exports = postSchema;
