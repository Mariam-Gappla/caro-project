const messages = {
  en: {
    rentalType: {
      required: "Rental type is required",
      only: "Rental type must be 'weekly/daily'",
      string: "Rental type must be a string"
    },
    images: {
      uri: "Each image must be a valid URI",
      base: "Images must be an array"
    },
    carType: {
      required: "Car type is required",
      string: "Car type must be a string"
    },
    licensePlateNumber: {
      required: "License plate number is required",
      string: "License plate number must be a string"
    },
    freeKilometers: {
      required: "Free kilometers is required",
      number: "Free kilometers must be a number"
    },
    odoMeter: {
      required: "Odometer is required",
      number: "Odometer must be a number"
    },
    pricePerFreeKilometer: {
      required: "Price per free kilometer is required",
      number: "Must be a number"
    },
    pricePerExtraKilometer: {
      required: "Price per extra kilometer is required",
      number: "Must be a number"
    },
    city: {
      required: "City is required",
      string: "City must be a string"
    },
    area: {
      required: "Area is required",
      string: "Area must be a string"
    },
    carDescription: {
      required: "Car description is required",
      string: "Car description must be a string"
    },
    deliveryOption: {
      boolean: "Delivery option must be true or false"
    },
    nameId: {
      required: "Name ID is required",
      string: "Name ID must be a string"
    },
    modelId: {
      required: "Model ID is required",
      string: "Model ID must be a string"
    }
  },

  ar: {
    rentalType: {
      required: "نوع الإيجار مطلوب",
      only: "نوع الإيجار يجب أن يكون 'weekly/daily'",
      string: "نوع الإيجار يجب أن يكون نصًا"
    },
    images: {
      uri: "كل صورة يجب أن تكون رابطًا صالحًا",
      base: "الصور يجب أن تكون في مصفوفة"
    },
    carType: {
      required: "نوع السيارة مطلوب",
      string: "نوع السيارة يجب أن يكون نصًا"
    },
    licensePlateNumber: {
      required: "رقم اللوحة مطلوب",
      string: "رقم اللوحة يجب أن يكون نصًا"
    },
    freeKilometers: {
      required: "عدد الكيلومترات المجانية مطلوب",
      number: "عدد الكيلومترات المجانية يجب أن يكون رقمًا"
    },
    odoMeter: {
      required: "عداد الكيلومترات مطلوب",
      number: "عداد الكيلومترات يجب أن يكون رقمًا"
    },
    pricePerFreeKilometer: {
      required: "سعر الكيلومتر المجاني مطلوب",
      number: "يجب أن يكون رقمًا"
    },
    pricePerExtraKilometer: {
      required: "سعر الكيلومتر الزائد مطلوب",
      number: "يجب أن يكون رقمًا"
    },
    city: {
      required: "المدينة مطلوبة",
      string: "المدينة يجب أن تكون نصًا"
    },
    area: {
      required: "المنطقة مطلوبة",
      string: "المنطقة يجب أن تكون نصًا"
    },
    carDescription: {
      required: "وصف السيارة مطلوب",
      string: "وصف السيارة يجب أن يكون نصًا"
    },
    deliveryOption: {
      boolean: "خيار التوصيل يجب أن يكون صحيح أو خطأ"
    },
    nameId: {
      required: "معرّف الاسم مطلوب",
      string: "معرّف الاسم يجب أن يكون نصًا"
    },
    modelId: {
      required: "معرّف الموديل مطلوب",
      string: "معرّف الموديل يجب أن يكون نصًا"
    }
  }
};
const getMessages = (lang = 'en') => {
  return messages[lang] || messages.en;
};
module.exports = getMessages;
