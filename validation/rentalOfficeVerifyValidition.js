const Joi = require('joi');
const getMessages = require('../locales/schemaValiditionMessages/rentalOfficeVerifyValiditionMessages');

const rentalOfficeSchema = (lang = 'en') => {
    const msg = getMessages(lang);
    return Joi.object({
        username: Joi.string()
            .trim()
            .min(2)
            .max(100)
            .required()
            .messages({
                'string.base': msg.username.base,
                'string.empty': msg.username.empty,
                'string.min': msg.username.min,
                'any.required': msg.username.required
            }),

        tradeRegisterNumber: Joi.string()
            .trim()
            .pattern(/^[0-9A-Za-z\-]{3,20}$/)
            .required()
            .messages({
                'string.base': msg.tradeRegisterNumber.base,
                'string.pattern.base': msg.tradeRegisterNumber.pattern,
                'string.empty': msg.tradeRegisterNumber.empty,
                'any.required': msg.tradeRegisterNumber.required
            }),

        location: Joi.object({
            type: Joi.string()
                .valid('Point')
                .required()
                .messages({
                    'any.only': msg.location.type,
                    'any.required': msg.location.type
                }),
            coordinates: Joi.array()
                .items(
                    Joi.number().required().messages({
                        'number.base': msg.location.coordinateNumber,
                        'any.required': msg.location.coordinateNumber
                    })
                )
                .length(2) // [lng, lat]
                .required()
                .messages({
                    'array.length': msg.location.coordinatesLength,
                    'any.required': msg.location.coordinatesRequired
                })
        })
            .required()
            .messages({
                'any.required': msg.location.required
            }),

        cityId: Joi.string()
            .trim()
            .min(2)
            .required()
            .messages({
                'string.base': msg.city.base,
                'string.empty': msg.city.empty,
                'any.required': msg.city.required
            }),
        administrationNumber: Joi.string().required().messages({
            'string.base': msg.administrationNumber.base,
            'string.empty': msg.administrationNumber.empty,
            'any.required': msg.administrationNumber.required
        }),
        employeeNumber: Joi.string().required().messages({
            'string.base': msg.employeeNumber.base,
            'string.empty': msg.employeeNumber.empty,
            'any.required': msg.employeeNumber.required
        }),
        phone: Joi.string().required().messages({
            'string.empty': msg.phone.required,
            'any.required': msg.phone.required,
        }),
        password: Joi.string().min(3).required().messages({
            'string.empty': msg.password.required,
            'string.min': msg.password.min,
            'any.required': msg.password.required,
        }),
        email: Joi.string().email().messages({
            'string.email':msg.email.invalid
        }),
        details: Joi.string()
            .trim()
            .min(10)
            .max(1000)
            .required()
            .messages({
                'string.base': msg.details.base,
                'string.min': msg.details.min,
                'string.max': msg.details.max,
                'string.empty': msg.details.required,
                'any.required': msg.details.required
            })
    });
};

module.exports = rentalOfficeSchema;
