const Joi = require('joi');
const getMessages = require('../locales/schemaValiditionMessages/verificationAccountMessages');

const winshSchema = (lang = 'en') => {
    const messages = getMessages(lang);

    return Joi.object({
        providerId: Joi.string()
            .required()
            .messages({
                'any.required': messages.providerIdRequired,
                'string.base': messages.providerIdRequired,
            }),

        fullName: Joi.string()
            .required()
            .messages({
                'any.required': messages.fullNameRequired,
                'string.base': messages.fullNameString,
            }),

        nationality: Joi.string()
            .required()
            .messages({
                'any.required': messages.nationalityRequired,
                'string.base': messages.nationalityString,
            }),

        nationalId: Joi.string()
            .required()
            .messages({
                'any.required': messages.nationalIdRequired,
                'string.base': messages.nationalIdString,
            }),

        birthDate: Joi.date()
            .required()
            .messages({
                'any.required': messages.birthDateRequired,
                'date.base': messages.birthDateDate,
            }),

        email: Joi.string()
            .email()
            .required()
            .messages({
                'any.required': messages.emailRequired,
                'string.base': messages.emailString,
                'string.email': messages.emailInvalid,
            }),

        iban: Joi.string()
            .required()
            .messages({
                'any.required': messages.ibanRequired,
                'string.base': messages.ibanString,
            }),

        bankAccountName: Joi.string()
            .required()
            .messages({
                'any.required': messages.bankAccountNameRequired,
                'string.base': messages.bankAccountNameString,
            }),

        winchType: Joi.string()
            .required()
            .messages({
                'any.required': messages.winchTypeRequired,
                'string.base': messages.winchTypeString,
            }),

        carPlateNumber: Joi.string()
            .required()
            .messages({
                'any.required': messages.carPlateNumberRequired,
                'string.base': messages.carPlateNumberString,
            }),

        serviceType: Joi.string()
            .valid('winch')
            .required()
            .messages({
                'any.required': messages.serviceTypeRequired,
                'any.only': messages.serviceTypeInvalid,
                'string.base': messages.serviceTypeString,
            }),
    })

};
const winshImagesSchema = (lang = 'en') => {
    const messages = getMessages(lang);
    return Joi.object({
        profileImage: Joi.string()
            .required()
            .messages({
                'any.required': messages.profileImageRequired,
                'string.base': messages.profileImageString,
                'string.empty': messages.profileImageRequired,
            }),

        nationalIdImage: Joi.string()
            .required()
            .messages({
                'any.required': messages.nationalIdImageRequired,
                'string.base': messages.nationalIdImageString,
                'string.empty': messages.nationalIdImageRequired,
            }),

        licenseImage: Joi.string()
            .required()
            .messages({
                'any.required': messages.licenseImageRequired,
                'string.base': messages.licenseImageString,
                'string.empty': messages.licenseImageRequired,
            }),

        carRegistrationImage: Joi.string()
            .required()
            .messages({
                'any.required': messages.carRegistrationImageRequired,
                'string.base': messages.carRegistrationImageString,
                'string.empty': messages.carRegistrationImageRequired,
            }),

        carImage: Joi.string()
            .required()
            .messages({
                'any.required': messages.carImageRequired,
                'string.base': messages.carImageString,
                'string.empty': messages.carImageRequired,
            }),
    })
}
module.exports = { winshSchema, winshImagesSchema };
