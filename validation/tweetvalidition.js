const Joi = require("joi");
const mongoose = require("mongoose");
const getMessages=require("../locales/schemaValiditionMessages/tweetValiditionMessages")

// التحقق من صحة الـ ObjectId
const isValidObjectId = (value, helpers) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return helpers.error("any.invalid");
  }
  return value;
};
const tweetValidationSchema = (lang = "en") => {
  const messages=getMessages(lang);
  return Joi.object({
    title: Joi.string().required().messages({
        "string.base": messages.title.base,
        "any.required": messages.title.required,
        "string.empty": messages.title.required
    }),
    content: Joi.string()
      .required()
      .messages({
        "string.base": messages.content.base,
        "any.required": messages.content.required,
        "string.empty": messages.content.required
      }),

    userId: Joi.string()
      .custom(isValidObjectId, "ObjectId Validation")
      .required()
      .messages({
        "any.required": messages.userId.base,
        "string.base": messages.userId.required,
        "any.invalid": messages.userId.invalid
      }),

    likedBy: Joi.array()
      .items(
        Joi.string().custom(isValidObjectId, "ObjectId Validation").messages({
          "string.base":messages.likedBy.base,
          "any.invalid": messages.likedBy.invalid
        })
      )
      .optional()
      .messages({
        "array.base": messages.likedBy.arraybase
      }),
      image:Joi.string().optional().messages({
        "string.base": messages.image.base,
      }),
    
    createdAt: Joi.date()
      .optional()
      .messages({
        "date.base": messages.createdAt.base
      })
  });
}

module.exports = { tweetValidationSchema };
