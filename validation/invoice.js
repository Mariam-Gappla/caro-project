const Joi = require("joi");
const getMessages = require("../locales/schemaValiditionMessages/invoiceValiditionMessages");

const invoiceSchema = (lang = "en") => {
  const messages = getMessages(lang);
  return Joi.object({
    userId: Joi.string().required().messages({
      "string.empty": messages.invoice.userId.required,
      "any.required": messages.invoice.userId.required,
    }),

    rentalOfficeId: Joi.string().required().messages({
      "string.empty": messages.invoice.rentalOfficeId.required,
      "any.required": messages.invoice.rentalOfficeId.required,
    }),

    orderId: Joi.string().required().messages({
      "string.empty": messages.invoice.orderId.required,
      "any.required": messages.invoice.orderId.required,
    }),
    date: Joi.date().optional(), 
  });
};

module.exports = {invoiceSchema};
