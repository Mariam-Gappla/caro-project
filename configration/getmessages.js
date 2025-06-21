
const getMessages = (lang) => {
  try {
    return require(`../locales/generalmessages/${lang === 'ar' ? 'ar' : 'en'}`);
  } catch (e) {
    return require('../locales/generalmessages/en'); // fallback
  }
};
module.exports=getMessages;