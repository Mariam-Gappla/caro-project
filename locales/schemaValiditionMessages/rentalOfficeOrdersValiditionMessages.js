const messages = {
  en: {
    userId: {
      required: "User ID is required",
    },
    rentalOfficeId: {
      required: "Rental office ID is required",
    },
    totalCost: {
      required: "Total cost is required",
      base: "Total cost must be a number"
    },
    carId: {
      required: "Car ID is required",
    },
    startDate: {
      required: "Start date is required",
      date: "Start date must be a valid date",
    },
    endDate: {
      required: "End date is required",
      date: "End date must be a valid date",
    },
    licenseImage: {
      required: "License image is required",
      string: "License image must be a valid URL",
    },
    paymentMethod: {
      required: "Payment method is required",
      valid: "Payment method must be either cash or online"
    },
    pickupLocation: {
      base: "Invalid location format",
      lat: "Latitude must be a number",
      long: "Longitude must be a number",
      requiredLat: "Latitude is required when delivery is selected",
      requiredLong: "Longitude is required when delivery is selected"
    },
    deliveryType: {
      required: "Delivery type is required",
      valid: "Delivery type must be either 'branch' or 'delivery'",
    },
    priceType: {
      required: 'Price type is required',
      base: 'Price type must be a string',
      only: 'Price type must be either "open_km" or "limited_km"',
    },
    totalAmount: {
      required: "Total amount is required",
      number: "Total amount must be a number",
    },
  },

  ar: {
    userId: {
      required: "معرّف المستخدم مطلوب",
    },
    rentalOfficeId: {
      required: "معرّف مكتب التأجير مطلوب",
    },
    totalCost: {
      required: "إجمالي التكلفة مطلوب",
      base: "إجمالي التكلفة يجب أن يكون رقمًا"
    },
    carId: {
      required: "معرّف السيارة مطلوب",
    },
    startDate: {
      required: "تاريخ الاستلام مطلوب",
      date: "تاريخ الاستلام يجب أن يكون تاريخًا صحيحًا",
    },
    endDate: {
      required: "تاريخ التسليم مطلوب",
      date: "تاريخ التسليم يجب أن يكون تاريخًا صحيحًا",
    },
    licenseImage: {
      required: "صورة الرخصة مطلوبة",
      string: "صورة الرخصة يجب أن تكون رابطًا صحيحًا",
    },
    paymentMethod: {
      required: "طريقة الدفع مطلوبة",
      valid: "طريقة الدفع يجب أن تكون إما كاش أو أونلاين"
    },
    pickupLocation: {
      base: "تنسيق الموقع غير صحيح",
      lat: "يجب أن يكون خط العرض رقمًا",
      long: "يجب أن يكون خط الطول رقمًا",
      requiredLat: "يجب إدخال خط العرض عند اختيار التوصيل",
      requiredLong: "يجب إدخال خط الطول عند اختيار التوصيل"
    },
    deliveryType: {
      required: "نوع الاستلام مطلوب",
      valid: "نوع الاستلام يجب أن يكون فرع أو توصيل",
    },
    priceType: {
      required: 'نوع التسعير مطلوب',
      base: 'نوع التسعير يجب أن يكون نصًا',
      only: 'نوع التسعير يجب أن يكون "open_km" أو "limited_km"',
    },
    totalAmount: {
      required: "الإجمالي مطلوب",
      number: "الإجمالي يجب أن يكون رقمًا",
    },
  },
};


const getMessages = (lang = 'en') => {
  return messages[lang] || messages.en;
};

module.exports = getMessages;
