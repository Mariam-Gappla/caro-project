const Joi = require("joi");
const getMessages = require("../locales/schemaValiditionMessages/showroomPostValiditionMessages");

const showroomPostSchema = (lang = "en") => {
  const messages = getMessages(lang);

  return Joi.object({
    title: Joi.string().required().messages(messages.title),
    deliveryOptionId: Joi.string()
      .required()
      .messages(messages.deliveryOptionId),

    carNameId: Joi.string().required().messages(messages.carNameId),

    carModelId: Joi.string().required().messages(messages.carModelId),

    carTypeId: Joi.string().required().messages(messages.carTypeId),

    cityId: Joi.string().required().messages(messages.cityId),

    showroomId: Joi.string().required().messages(messages.showroomId),

    transmissionTypeId: Joi.string()
      .required()
      .messages(messages.transmissionTypeId),

    fuelTypeId: Joi.string().required().messages(messages.fuelTypeId),

    carBodyId: Joi.string().required().messages(messages.carBodyId),

    cylindersId: Joi.string().required().messages(messages.cylindersId),

    carConditionId: Joi.string().required().messages(messages.carConditionId),

    interiorColor: Joi.string().required().messages(messages.interiorColor),

    exteriorColor: Joi.string().required().messages(messages.exteriorColor),

    discription: Joi.string().required().messages(messages.discription),

    advantages: Joi.array()
      .items(Joi.string())
      .min(1)
      .required()
      .messages(messages.advantages),

    discount: Joi.boolean().required().messages(messages.discount),

    financing: Joi.boolean().required().messages(messages.financing),

    price: Joi.number().required().messages(messages.price),

    year: Joi.number().integer().required().messages(messages.year),

    discountedPrice: Joi.number().when("discount", {
      is: true,
      then: Joi.number()
        .less(Joi.ref("price"))
        .required()
        .messages(messages.discountedPriceRequired),
      otherwise: Joi.forbidden().messages(messages.discountedPriceNotAllowed),
    }),
  });
};

module.exports = showroomPostSchema;
