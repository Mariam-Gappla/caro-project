const messages = {
  en: {
    pickupDate: {
      date: "Pickup date must be a valid date",
      required: "Pickup date is required"
    },
    returnDate: {
      date: "Return date must be a valid date",
      required: "Return date is required"
    },
    licenseImage: {
      uri: "License image must be a valid URL"
    },
    paymentMethod: {
      string: "Payment method must be a string",
      required: "Payment method is required"
    },
    pickupType: {
      string: "Pickup type must be a string",
      required: "Pickup type is required"
    },
    totalPrice: {
      number: "Total price must be a number",
      required: "Total price is required"
    },
    deliveryLocation: {
      string: "Delivery location must be a string",
      required: "Delivery location is required"
    }
  },

  ar: {
    pickupDate: {
      date: "تاريخ الاستلام يجب أن يكون تاريخًا صالحًا",
      required: "تاريخ الاستلام مطلوب"
    },
    returnDate: {
      date: "تاريخ التسليم يجب أن يكون تاريخًا صالحًا",
      required: "تاريخ التسليم مطلوب"
    },
    licenseImage: {
      uri: "رابط صورة الرخصة غير صحيح"
    },
    paymentMethod: {
      string: "وسيلة الدفع يجب أن تكون نصًا",
      required: "وسيلة الدفع مطلوبة"
    },
    pickupType: {
      string: "نوع الاستلام يجب أن يكون نصًا",
      required: "نوع الاستلام مطلوب"
    },
    totalPrice: {
      number: "إجمالي السعر يجب أن يكون رقمًا",
      required: "إجمالي السعر مطلوب"
    },
    deliveryLocation: {
      string: "موقع التوصيل يجب أن يكون نصًا",
      required: "موقع التوصيل مطلوب"
    }
  }
};
const getupdateMessages = (lang = 'en') => {
    return messages[lang] || messages.en;
};
module.exports = getupdateMessages;
