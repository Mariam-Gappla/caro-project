const messages = {
  en: {
    userId: {
      required: "User ID is required",
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
      valid: "Payment method must be a valid value",
    },
    pickupLocation: {
      base: "Pickup location must be an object",
      lat: "Latitude must be a number",
      long: "Longitude must be a number",
    },
    deliveryType: {
      required: "Delivery type is required",
      valid: "Delivery type must be either 'branch' or 'delivery'",
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
      valid: "طريقة الدفع غير صحيحة",
    },
    pickupLocation: {
      base: "موقع الاستلام يجب أن يكون كائن يحتوي على lat و long",
      lat: "خط العرض يجب أن يكون رقمًا",
      long: "خط الطول يجب أن يكون رقمًا",
    },
    deliveryType: {
      required: "نوع الاستلام مطلوب",
      valid: "نوع الاستلام يجب أن يكون فرع أو توصيل",
    },
    totalAmount: {
      required: "الإجمالي مطلوب",
      number: "الإجمالي يجب أن يكون رقمًا",
    },
  },
};

const getMessages = (lang = "en") => messages[lang] || messages.en;

module.exports = getMessages;
