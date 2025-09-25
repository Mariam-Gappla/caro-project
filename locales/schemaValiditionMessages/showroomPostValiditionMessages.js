const messages = {
  en: {
    title: { "any.required": "Title is required" },
    images: { "any.required": "Images are required", "array.min": "At least one image is required" },
    video: { "string.base": "Video must be a string" },
    deliveryOptionId: { "any.required": "Delivery option is required" },
    carNameId: { "any.required": "Car name is required" },
    carModelId: { "any.required": "Car model is required" },
    carTypeId: { "any.required": "Car type is required" },
    cityId: { "any.required": "City is required" },
    showroomId: { "any.required": "Showroom ID is required" },
    transmissionTypeId: { "any.required": "Transmission type is required" },
    fuelTypeId: { "any.required": "Fuel type is required" },
    carBodyId: { "any.required": "Car body is required" },
    cylindersId: { "any.required": "Cylinders are required" },
    carConditionId: { "any.required": "Car condition is required" },
    interiorColor: { "any.required": "Interior color is required" },
    exteriorColor: { "any.required": "Exterior color is required" },
    discription: { "any.required": "Description is required" },
    advantages: { "any.required": "Advantages are required", "array.min": "At least one advantage is required" },
    discount: { "any.required": "Discount flag is required" },
    financing: { "any.required": "Financing flag is required" },
    price: { "any.required": "Price is required", "number.base": "Price must be a number" },
    year: { "any.required": "Year is required", "number.base": "Year must be a number" },
    postNumber: { "any.required": "Post number is required" },
    discountedPriceRequired: {
      "any.required": "Discounted price is required when discount is true",
      "number.less": "Discounted price must be less than original price"
    },
    discountedPriceNotAllowed: {
      "any.unknown": "Discounted price is not allowed when discount is false"
    },
  },

  ar: {
    title: { "any.required": "العنوان مطلوب" },
    images: { "any.required": "الصور مطلوبة", "array.min": "يجب إدخال صورة واحدة على الأقل" },
    video: { "string.base": "الفيديو يجب أن يكون نص" },
    deliveryOptionId: { "any.required": "خيار التوصيل مطلوب" },
    carNameId: { "any.required": "اسم السيارة مطلوب" },
    carModelId: { "any.required": "موديل السيارة مطلوب" },
    carTypeId: { "any.required": "نوع السيارة مطلوب" },
    cityId: { "any.required": "المدينة مطلوبة" },
    showroomId: { "any.required": "معرف المعرض مطلوب" },
    transmissionTypeId: { "any.required": "نوع ناقل الحركة مطلوب" },
    fuelTypeId: { "any.required": "نوع الوقود مطلوب" },
    carBodyId: { "any.required": "هيكل السيارة مطلوب" },
    cylindersId: { "any.required": "عدد الاسطوانات مطلوب" },
    carConditionId: { "any.required": "حالة السيارة مطلوبة" },
    interiorColor: { "any.required": "اللون الداخلي مطلوب" },
    exteriorColor: { "any.required": "اللون الخارجي مطلوب" },
    discription: { "any.required": "الوصف مطلوب" },
    advantages: { "any.required": "المميزات مطلوبة", "array.min": "يجب إدخال ميزة واحدة على الأقل" },
    discount: { "any.required": "حقل التخفيض مطلوب" },
    financing: { "any.required": "حقل التمويل مطلوب" },
    price: { "any.required": "السعر مطلوب", "number.base": "السعر يجب أن يكون رقماً" },
    year: { "any.required": "السنة مطلوبة", "number.base": "السنة يجب أن تكون رقماً" },
    postNumber: { "any.required": "رقم الإعلان مطلوب" },
    discountedPriceRequired: {
      "any.required": "السعر بعد الخصم مطلوب عند وجود تخفيض",
      "number.less": "السعر بعد الخصم يجب أن يكون أقل من السعر الأصلي"
    },
    discountedPriceNotAllowed: {
      "any.unknown": "لا يمكن إدخال سعر بعد الخصم إذا لم يكن هناك تخفيض"
    },
  },
};

const getMessages = (lang = 'ar') => messages[lang] || messages.ar;
module.exports = getMessages;
