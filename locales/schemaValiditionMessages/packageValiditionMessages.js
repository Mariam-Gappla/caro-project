const messages = {
  en: {
    requiredTitleEn: "Title in English is required",
    requiredTitleAr: "Title in Arabic is required",
    requiredDuration: "Duration is required",
    requiredPrice: "Price is required",
    invalidDuration: "Duration must be a positive number",
    invalidPrice: "Price must be a positive number",
  },
  ar: {
    requiredTitleEn: "العنوان بالإنجليزية مطلوب",
    requiredTitleAr: "العنوان بالعربية مطلوب",
    requiredDuration: "مدة الاشتراك مطلوبة",
    requiredPrice: "سعر الباقة مطلوب",
    invalidDuration: "المدة يجب أن تكون رقمًا موجبًا",
    invalidPrice: "السعر يجب أن يكون رقمًا موجبًا",
  },
};
const getMessages = (lang = 'en') => {
    return messages[lang] || messages.en;
};
module.exports = getMessages;
