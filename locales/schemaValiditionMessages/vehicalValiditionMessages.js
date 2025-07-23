const messages = {
  en: {
      nameRequired: "Vehicle type name is required.",
      nameString: "Vehicle type name must be a string.",
  },
  ar: {
      nameRequired: "اسم نوع الونش مطلوب.",
      nameString: "يجب أن يكون اسم نوع الونش نصًا.",
  }
};
const getMessages = (lang = 'en') => messages[lang] || messages.en
module.exports =getMessages;
