const messages = {
    en: {
      nameRequiredEn: "sub Category name is required.",
    },
    ar: {
      nameRequired: "اسم التصنيف الفرعى مطلوب.",
    }
}
const getMessages = (lang = 'ar') => {
    return messages[lang] || messages.ar;
};
module.exports=getMessages;
