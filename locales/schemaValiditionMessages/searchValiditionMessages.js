const messages = {
  en: {
    title: { "any.required": "Title is required", "string.base": "Title must be a string" },
    images: { "any.required": "Images are required", "array.min": "At least one image is required" },
    video: { "string.base": "Video must be a string" },
    details: { "any.required": "Details are required" },
    contactMethods: { 
      "any.required": "At least one contact method is required", 
      "array.min": "At least one contact method is required", 
      "any.only": "Contact method must be WhatsApp, Call, or Chat" 
    },
    cityId: { "any.required": "City is required" },
    price: { "any.required": "Price is required", "number.base": "Price must be a number" },
    phoneNumberRequired: { "any.required": "Phone number is required when WhatsApp or Call is selected" }
  },

  ar: {
    title: { "any.required": "العنوان مطلوب", "string.base": "العنوان يجب أن يكون نصاً" },
    images: { "any.required": "الصور مطلوبة", "array.min": "يجب إدخال صورة واحدة على الأقل" },
    video: { "string.base": "الفيديو يجب أن يكون نص" },
    details: { "any.required": "التفاصيل مطلوبة" },
    contactMethods: { 
      "any.required": "يجب اختيار وسيلة اتصال واحدة على الأقل", 
      "array.min": "يجب اختيار وسيلة اتصال واحدة على الأقل", 
      "any.only": "وسيلة الاتصال يجب أن تكون واتساب أو مكالمة أو محادثة" 
    },
    price: { "any.required": "السعر مطلوب", "number.base": "السعر يجب أن يكون رقماً" },
    cityId: { "any.required": "المدينة مطلوبة" },
    phoneNumberRequired: { "any.required": "رقم الهاتف مطلوب عند اختيار واتساب أو مكالمة" }
  },
};

const getMessages = (lang = "en") => messages[lang] || messages.en;
module.exports=getMessages;