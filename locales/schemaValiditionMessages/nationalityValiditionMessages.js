const messages = {
  en: {
      nameRequired: "Nationality name is required.",
      nameString: "Nationality name must be a string.",
  },
  ar: {
      nameRequired: "اسم الجنسية مطلوب",
      nameString: "يجب أن يكون اسم الجنسية نصًا",
  }
};
const getMessages = (lang = 'en') => messages[lang] || messages.en
module.exports =getMessages;
