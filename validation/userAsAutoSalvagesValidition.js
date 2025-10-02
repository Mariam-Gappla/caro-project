const Joi=require("joi");
const getMessages=require("../locales/schemaValiditionMessages/userAsAutoSalvageValiditionMessages");

const userAsAutoSalvageSchema = (lang = "en") => {
  const messages = getMessages(lang);

  return Joi.object({
    username: Joi.string().min(3).max(30).required().messages(messages.username),
    cityId: Joi.string().required().messages(messages.city),
    service: Joi.string().required().messages(messages.service),
    brand: Joi.array().items(Joi.string().required()).min(1).required().messages(messages.brand),
  });
};

module.exports=userAsAutoSalvageSchema;
