const { number, required } = require("joi");

const messages = {
  ar: {
    rentalType: {
      required: "نوع التأجير مطلوب",
      valid: "نوع التأجير يجب أن weekly/daily or rent to own ",
      string: "نوع التأجير يجب أن يكون نصًا"
    },
    images: {
      base: "الصور يجب أن تكون في مصفوفة",
      uri: "رابط الصورة غير صحيح"
    },
    carName: {
      required: "اسم السيارة مطلوب",
      string: "اسم السيارة يجب أن يكون نصًا"
    },
    carType: {
      required: "نوع السيارة مطلوب",
      string: "نوع السيارة يجب أن يكون نصًا"
    },
    carModel: {
      required: "موديل السيارة مطلوب",
      number: "موديل السيارة يجب أن يكون رقمًا"
    },
    licensePlateNumber: {
      required: "رقم اللوحة مطلوب",
      string: "رقم اللوحة يجب أن يكون نصًا"
    },
    freeKilometers: {
      required: "عدد الكيلومترات المجانية مطلوب",
      number: "عدد الكيلومترات المجانية يجب أن يكون رقمًا"
    },
    pricePerFreeKilometer: {
      required: "سعر الكيلو المجاني مطلوب",
      number: "سعر الكيلو المجاني يجب أن يكون رقمًا"
    },
    pricePerExtraKilometer: {
      required: "سعر الكيلو الزائد مطلوب",
      number: "سعر الكيلو الزائد يجب أن يكون رقمًا"
    },
    ownershipPeriod: {
      required: 'مدة التملك مطلوبة',
      base: 'مدة التملك يجب أن تكون رقمًا',
    },
    city: {
      required: "اسم المدينة مطلوب",
      string: "اسم المدينة يجب أن يكون نصًا"
    },
    area: {
      required: "اسم المنطقة مطلوبة",
      string: "اسم المنطقة يجب أن يكون نصًا"
    },
    carDescription: {
      required: "وصف السيارة مطلوب",
      string: "وصف السيارة يجب أن يكون نصًا"
    },
    deliveryOption: {
      boolean: "خيار التوصيل يجب أن يكون صح أو خطأ (true/false)"
    },
    odoMeter:{
      required:"عداد السياره مطلوب",
      number:"عداد السياره مطلوب"
    },
    title: {
      base: 'العنوان يجب أن يكون نصًا',
      empty: 'العنوان لا يمكن أن يكون فارغًا',
      required: 'العنوان مطلوب'
    }

  },

  en: {
    rentalType: {
      required: "Rental type is required",
      valid: "Rental type must be 'weekly/daily' or 'rent to own'",
      string: "Rental type must be a string"
    },
    images: {
      base: "Images must be an array",
      uri: "Invalid image URL"
    },
    carName: {
      required: "Car name is required",
      string: "Car name must be a string"
    },
    carType: {
      required: "Car type is required",
      string: "Car type must be a string"
    },
    carModel: {
      required: "Car model is required",
      number: "Car model must be a number"
    },
    licensePlateNumber: {
      required: "License plate number is required",
      string: "License plate number must be a string"
    },
    freeKilometers: {
      required: "Free kilometers are required",
      number: "Free kilometers must be a number"
    },
    pricePerFreeKilometer: {
      required: "Price per free kilometer is required",
      number: "Price per free kilometer must be a number"
    },
    pricePerExtraKilometer: {
      required: "Price per extra kilometer is required",
      number: "Price per extra kilometer must be a number"
    },
    city: {
      required: "City name is required",
      string: "City name must be a string"
    },
    ownershipPeriod: {
      'any.required': 'Ownership duration is required',
      'number.base': 'Ownership duration must be a number',
    },
    area: {
      required: "Area name is required",
      string: "Area name must be a string"
    },
    carDescription: {
      required: "Car description is required",
      string: "Car description must be a string"
    },
    deliveryOption: {
      boolean: "Delivery option must be true or false"
    },
     odoMeter:{
      required:"odoMeter is required",
      number:"odoMeter must be number"
     },
      title: {
      base: 'Title must be a string',
      empty: 'Title cannot be empty',
      required: 'Title is required'
    }
  }
};
const getMessages = (lang = 'en') => {
    return messages[lang] || messages.en;
};
module.exports = getMessages;
