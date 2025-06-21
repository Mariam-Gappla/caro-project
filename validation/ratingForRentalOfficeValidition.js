const Joi = require('joi');
const getMessages=require("../locales/schemaValiditionMessages/ratingForOrderValiditionMessages");
const ratingSchemaValidation = (lang='en')=>{
  const msg=getMessages(lang);
   return  Joi.object({
    
    orderId: Joi.string().required().messages({
      'any.required': msg.orderId.required,
      'string.base': msg.orderId.string
    }),
    targetType: Joi.string().valid('rentalOffice', 'serviceProvider').required().messages({
      'any.required': msg.targetType.required,
      'any.only': msg.targetType.valid,
      'string.base': msg.targetType.string
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
   ratingSchemaValidation
}
