const messages = {
  en: {
    name: "Name is required",
      phone: "Phone is required",
      message: "Message is required",
      senderType: "Sender type must be one of: user, serviceProvider, or rentalOffice",
      senderId: "Sender ID is required"
  },
  ar: {
    name: "الاسم مطلوب",
      phone: "رقم الهاتف مطلوب",
      message: "الرسالة مطلوبة",
      senderType: "نوع المُرسل يجب أن يكون user أو serviceProvider أو rentalOffice",
      senderId: "معرّف المُرسل مطلوب"
  }
};
const getMessages = (lang = 'en') => {
  return messages[lang] || messages.en;
};

module.exports = getMessages;
