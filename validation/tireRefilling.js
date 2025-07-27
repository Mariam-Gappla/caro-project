const Joi = require('joi');
const getMessages = require('../locales/schemaValiditionMessages/verificationAccountMessages');

const tireSchema = (lang = 'en') => {
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
        serviceType: Joi.string()
            .valid('tire Filling', 'battery Jumpstart', 'tire Filling and battery Jumpstart')
            .required()
            .messages({
                'any.required': messages.serviceTypeRequired,
                'any.only': messages.serviceTypeInvalid,
                'string.base': messages.serviceTypeString,
            }),
    });
};
const tireImagesSchema = (lang = 'en') => {
    const messages = getMessages(lang);

    return Joi.object({
        notes: Joi.string()
            .min(5)       // مثال على الحد الأدنى (ممكن تغير الرقم حسب الحاجة)
            .max(100)     // مثال على الحد الأقصى
            .messages({
                'any.required': messages.notesRequired,
                'string.base': messages.notesString,
                'string.empty': messages.notesEmpty,
                'string.min': messages.notesMin,
                'string.max': messages.notesMax
            }),

        profileImage: Joi.string()
            .required()
            .messages({
                'any.required': messages.profileImageRequired,
                'string.base': messages.profileImageString,
                'string.empty': messages.profileImageRequired,
            }),
    })
}

module.exports = { tireSchema, tireImagesSchema };
