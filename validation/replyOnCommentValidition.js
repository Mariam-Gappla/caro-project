const Joi = require("joi");
const mongoose = require("mongoose");
const getMessages=require("../locales/schemaValiditionMessages/replyOnCommentValiditionMessages")
const isValidObjectId = (value, helpers) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return helpers.error("any.invalid");
  }
  return value;
};

const replyOnCommentValiditionSchema = (lang="en")=>{
  const messages=getMessages(lang)
  return Joi.object({
  userId: Joi.string().custom(isValidObjectId, "ObjectId validation")
    .required()
    .messages({
      "any.required": messages.userId.required,
      "any.invalid": messages.userId.invalid,
      "string.base": messages.userId.base
    }),

  tweetId: Joi.string().custom(isValidObjectId, "ObjectId validation")
    .required()
    .messages({
      "any.required": messages.tweetId.required,
      "any.invalid": messages.tweetId.invalid,
      "string.base": messages.tweetId.base
    }),

  commentId: Joi.string().custom(isValidObjectId, "ObjectId validation")
    .required()
    .messages({
      "any.required": messages.commentId.required,
      "any.invalid": messages.commentId.invalid,
      "string.base": messages.commentId.base
    }),

  content: Joi.string().trim().min(1)
    .required()
    .messages({
      "string.empty": messages.content.empty,
      "any.required": messages.content.required,
      "string.base": messages.content.base,
      "string.min": messages.content.min
    })
});
}
module.exports={replyOnCommentValiditionSchema}
