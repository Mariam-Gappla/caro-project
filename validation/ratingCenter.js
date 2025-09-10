const Joi = require('joi');
const getMessages=require("../locales/schemaValiditionMessages/ratingCenter");
const ratingCenterSchemaValidation = (lang='en')=>{
  const msg=getMessages(lang);
   return  Joi.object({
    centerId: Joi.string().required().messages({
      'any.required': msg.centerId.required,
      'string.base': msg.centerId.string
    }),
    rating: Joi.number().min(1).max(5).required().messages({
      'any.required': msg.rating.required,
      'number.base': msg.rating.number,
      'number.min': msg.rating.min,
      'number.max': msg.rating.max
    }),
    comment: Joi.string().allow('').optional().messages({
      'string.base': msg.comment.string
    })
  });
}

module.exports={
  ratingCenterSchemaValidation
}
