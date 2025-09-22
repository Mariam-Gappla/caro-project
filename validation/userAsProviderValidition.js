const Joi = require("joi");
const getMessages = require("../locales/schemaValiditionMessages/userAsProviderMessages");
const userAsProviderSchema = (lang = "en") => {
    const messages = getMessages(lang);
    console.log(messages)
    return Joi.object({
        location: Joi.object({
            type: Joi.string().valid("Point").required().messages({
                "any.only": messages.locationType, // لازم يكون Point
                "any.required": messages.locationType,
            }),
            coordinates: Joi.array()
                .items(
                    Joi.number().required().messages({
                        "number.base": messages.coordinateNumber,
                        "any.required": messages.coordinateNumber,
                    })
                )
                .length(2) // [lng, lat]
                .required()
                .messages({
                    "array.length": messages.coordinatesLength,
                    "any.required": messages.coordinatesRequired,
                }),
        }).required().messages({
            "any.required": messages.locationRequired,
        }),

        cityId: Joi.string().required().messages({
            "string.empty": messages.cityId,
            "any.required": messages.cityId
        }),
        whatsAppNumber: Joi.string().required().messages({
            "string.empty": messages.whatsAppNumber,
            "any.required": messages.whatsAppNumber
        }),
        details: Joi.string().required().messages({
            "string.empty": messages.details,
            "any.required": messages.details
        }),
        categoryCenterId: Joi.string().required().messages({
            "string.empty": messages.categoryCenterId,
            "any.required": messages.categoryCenterId
        }),
        subCategoryCenterId: Joi.string().required().messages({
            "string.empty": messages.subCategoryCenterId,
            "any.required": messages.subCategoryCenterId
        }),
        tradeRegisterNumber: Joi.string().required().messages({
            "string.empty": messages.tradeRegisterNumber,
            "any.required": messages.tradeRegisterNumber
        }),
        username: Joi.string().required().messages({
            "string.empty": messages.userName,
            "any.required": messages.userName
        }),
        nationalId: Joi.string().required().messages({
            "string.empty": messages.nationalId,
            "any.required": messages.nationalId
        }),
        email: Joi.string().required().messages({
            "string.empty": messages.email,
            "any.required": messages.email
        }),
    });
};

module.exports = userAsProviderSchema;