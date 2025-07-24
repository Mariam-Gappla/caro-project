const messages = {
  en: {
    serviceTypeRequired: "Service type is required",
    serviceTypeInvalid: "Invalid service type",

    imageRequired: "Image URL is required",
    imageInvalid: "Image must be a valid URL",

    detailsRequired: "Details are required",
    detailsInvalid: "Details must be a string",

    locationRequired: "Location is required",
    locationLatRequired: "Latitude is required",
    locationLatInvalid: "Latitude must be a number",
    locationLongRequired: "Longitude is required",
    locationLongInvalid: "Longitude must be a number",

    paymentTypeRequired: "Payment type is required",
    paymentTypeInvalid: "Invalid payment type",

    carLocationRequired: "Car location is required",
    carLatRequired: "Car latitude is required",
    carLatInvalid: "Car latitude must be a number",
    carLongRequired: "Car longitude is required",
    carLongInvalid: "Car longitude must be a number",

    dropoffLocationRequired: "Drop-off location is required",
    dropoffLatRequired: "Drop-off latitude is required",
    dropoffLatInvalid: "Drop-off latitude must be a number",
    dropoffLongRequired: "Drop-off longitude is required",
    dropoffLongInvalid: "Drop-off longitude must be a number",
  },

  ar: {
    serviceTypeRequired: "نوع الخدمة مطلوب",
    serviceTypeInvalid: "نوع الخدمة غير صالح",

    imageRequired: "رابط الصورة مطلوب",
    imageInvalid: "يجب أن يكون رابط الصورة صحيحًا",

    detailsRequired: "التفاصيل مطلوبة",
    detailsInvalid: "يجب أن تكون التفاصيل نصًا",

    locationRequired: "الموقع مطلوب",
    locationLatRequired: "خط العرض مطلوب",
    locationLatInvalid: "خط العرض يجب أن يكون رقمًا",
    locationLongRequired: "خط الطول مطلوب",
    locationLongInvalid: "خط الطول يجب أن يكون رقمًا",

    paymentTypeRequired: "نوع الدفع مطلوب",
    paymentTypeInvalid: "نوع الدفع غير صالح",

    carLocationRequired: "موقع السيارة مطلوب",
    carLatRequired: "خط العرض لموقع السيارة مطلوب",
    carLatInvalid: "خط العرض لموقع السيارة يجب أن يكون رقمًا",
    carLongRequired: "خط الطول لموقع السيارة مطلوب",
    carLongInvalid: "خط الطول لموقع السيارة يجب أن يكون رقمًا",

    dropoffLocationRequired: "موقع النزول مطلوب",
    dropoffLatRequired: "خط العرض لموقع النزول مطلوب",
    dropoffLatInvalid: "خط العرض لموقع النزول يجب أن يكون رقمًا",
    dropoffLongRequired: "خط الطول لموقع النزول مطلوب",
    dropoffLongInvalid: "خط الطول لموقع النزول يجب أن يكون رقمًا",
  },
};

const getMessages = (lang = 'en') => messages[lang] || messages.en;

module.exports =getMessages;
