const Joi = require('joi');
const getMessages=require("../locales/schemaValiditionMessages/followersForRentalOfficeValiditionMessages")
const followerSchemaValidation = (lang='en')=>{
  const messages=getMessages(lang);
  return Joi.object({
  userId: Joi.string().required().messages({
    'string.base': messages.userId.base,
    'any.required': messages.userId.required
  }),

  rentalOfficeId: Joi.string().required().messages({
    'string.base': messages.rentalOfficeId.base,
    'any.required': messages.rentalOfficeId.required
  }),

  followedAt: Joi.date().optional().messages({
    'date.base':messages.followedAt.base
  })
});
}
module.exports={
 followerSchemaValidation   
}