const messages = {
  en: {
    titleEn: "Title (English) is required.",
    titleAr: "Title (Arabic) is required.",
    benefitsEn: "Benefits (English) must include at least one item.",
    benefitsAr: "Benefits (Arabic) must include at least one item.",
    termsEn: "Terms (English) must include at least one item.",
    termsAr: "Terms (Arabic) must include at least one item.",
  },

  ar: {
    titleEn: "حقل العنوان بالإنجليزية مطلوب.",
    titleAr: "حقل العنوان بالعربية مطلوب.",
    benefitsEn: "يجب إدخال ميزة واحدة على الأقل بالإنجليزية.",
    benefitsAr: "يجب إدخال ميزة واحدة على الأقل بالعربية.",
    termsEn: "يجب إدخال شرط واحد على الأقل بالإنجليزية.",
    termsAr: "يجب إدخال شرط واحد على الأقل بالعربية.",
  },
};
const getMessages = (lang = 'en') => {
    return messages[lang] || messages.en;
};
module.exports=getMessages;