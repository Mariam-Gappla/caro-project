const Joi = require("joi");
const getMessages = require("../locales/schemaValiditionMessages/reportValiditionMessages");
const reportSchema = (lang="en") => {
    const messages = getMessages(lang);
   return Joi.object({
    userId: Joi.string().required().messages(messages.userId),
    entityId: Joi.string().required().messages(messages.entityId),
    entityType: Joi.string()
      .valid("Post", "ShowRoomPosts")
      .required()
      .messages(messages.entityType),
    reason: Joi.string().min(3).required().messages(messages.reason),
    isViolation: Joi.boolean().required().messages(messages.isViolation),
  });
};
module.exports= reportSchema;