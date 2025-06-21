const messages = {
  en: {
    name: {
      required: "Name is required",
      min: "Name must be at least 2 characters",
      max: "Name must be at most 100 characters",
    },
    phone: {
      required: "Phone number is required",
      min: "Phone number must be at least 6 digits",
      max: "Phone number must be at most 20 digits",
    },
    message: {
      required: "Message is required",
      min: "Message must be at least 5 characters",
    },
  },
  ar: {
    name: {
      required: "الاسم مطلوب",
      min: "يجب ألا يقل الاسم عن حرفين",
      max: "يجب ألا يزيد الاسم عن 100 حرف",
    },
    phone: {
      required: "رقم الهاتف مطلوب",
      min: "يجب ألا يقل رقم الهاتف عن 6 أرقام",
      max: "يجب ألا يزيد رقم الهاتف عن 20 رقمًا",
    },
    message: {
      required: "الرسالة مطلوبة",
      min: "يجب ألا تقل الرسالة عن 5 أحرف",
    },
  },
};

const getMessages = (lang = 'en') => {
  return messages[lang] || messages.en;
};

module.exports = getMessages;
