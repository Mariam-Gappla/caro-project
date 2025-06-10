const Joi = require('joi');
const carRentalValidationSchema = Joi.object({
  rentalType: Joi.string()
    .valid("يومى","اسبوعى","اسبوعي","يومي","منتهى بتملك","منتهي بتملك")
    .required()
    .messages({
      'any.required': 'نوع التأجير مطلوب',
      'any.only': "نوع التأجير يجب أن يكون يومي/أسبوعى أو منتهي بالتمليك",
      'string.base': 'نوع التأجير يجب أن يكون نصًا'
    }),

  images: Joi.array().items(Joi.string().uri().messages({
    'string.uri': 'رابط الصورة غير صحيح'
  })).messages({
    'array.base': 'الصور يجب أن تكون في مصفوفة'
  }),

  carName: Joi.string().required().messages({
    'string.base': 'اسم السيارة يجب أن يكون نصًا',
    'any.required': 'اسم السيارة مطلوب'
  }),

  carType: Joi.string().required().messages({
    'string.base': 'نوع السيارة يجب أن يكون نصًا',
    'any.required': 'نوع السيارة مطلوب'
  }),

  carModel: Joi.number().required().messages({
    'number.base': 'موديل السيارة يجب أن يكون رقمًا',
    'any.required': 'موديل السيارة مطلوب'
  }),

  licensePlateNumber: Joi.string().required().messages({
    'string.base': 'رقم اللوحة يجب أن يكون نصًا',
    'any.required': 'رقم اللوحة مطلوب'
  }),

  freeKilometers: Joi.number().required().messages({
    'number.base': 'عدد الكيلومترات المجانية يجب أن يكون رقمًا',
    'any.required': 'عدد الكيلومترات المجانية مطلوب'
  }),

  pricePerFreeKilometer: Joi.number().required().messages({
    'number.base': 'سعر الكيلو المجاني يجب أن يكون رقمًا',
    'any.required': 'سعر الكيلو المجاني مطلوب'
  }),

  pricePerExtraKilometer: Joi.number().required().messages({
    'number.base': 'سعر الكيلو الزائد يجب أن يكون رقمًا',
    'any.required': 'سعر الكيلو الزائد مطلوب'
  }),

  city: Joi.string().required().messages({
    'string.base': 'اسم المدينة يجب أن يكون نصًا',
    'any.required': 'اسم المدينة مطلوب'
  }),

  area: Joi.string().required().messages({
    'string.base': 'اسم المنطقة يجب أن يكون نصًا',
    'any.required': 'اسم المنطقة مطلوب'
  }),

  carDescription: Joi.string().required().messages({
    'string.base': 'وصف السيارة يجب أن يكون نصًا',
    'any.required': 'وصف السيارة مطلوب'
  }),

  deliveryOption: Joi.boolean().messages({
    'boolean.base': 'خيار التوصيل يجب أن يكون صح أو خطأ (true/false)'
  })
});
const updateCarRentalValidationSchema = Joi.object({ 
  pickupDate: Joi.date().required().messages({
    'date.base': 'تاريخ الاستلام يجب أن يكون تاريخًا صالحًا',
    'any.required': 'تاريخ الاستلام مطلوب'
  }),

  returnDate: Joi.date().required().messages({
    'date.base': 'تاريخ التسليم يجب أن يكون تاريخًا صالحًا',
    'any.required': 'تاريخ التسليم مطلوب'
  }),

  licenseImage: Joi.string().uri().allow(null, '').messages({
    'string.uri': 'رابط صورة الرخصة غير صحيح'
  }),

  paymentMethod: Joi.string().required().messages({
    'string.base': 'وسيلة الدفع يجب أن تكون نصًا',
    'any.required': 'وسيلة الدفع مطلوبة'
  }),

  pickupType: Joi.string().required().messages({
    'string.base': 'نوع الاستلام يجب أن يكون نصًا',
    'any.required': 'نوع الاستلام مطلوب'
  }),

  totalPrice: Joi.number().required().messages({
    'number.base': 'إجمالي السعر يجب أن يكون رقمًا',
    'any.required': 'إجمالي السعر مطلوب'
  }),

  deliveryLocation: Joi.string().required().messages({
    'string.base': 'موقع التوصيل يجب أن يكون نصًا',
    'any.required': 'موقع التوصيل مطلوب'
  }),
});

module.exports={
carRentalValidationSchema,
updateCarRentalValidationSchema
}