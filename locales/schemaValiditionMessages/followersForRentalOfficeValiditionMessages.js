const messages = {
  en: {
    userId: {
      base: 'User ID must be a string',
      required: 'User ID is required',
    },
    rentalOfficeId: {
      base: 'Rental Office ID must be a string',
      required: 'Rental Office ID is required',
    },
    followedAt: {
      base: 'Followed date must be a valid date',
    },
  },
  ar: {
    userId: {
      base: 'معرف المستخدم يجب أن يكون نصًا',
      required: 'معرف المستخدم مطلوب',
    },
    rentalOfficeId: {
      base: 'معرف مكتب التأجير يجب أن يكون نصًا',
      required: 'معرف مكتب التأجير مطلوب',
    },
    followedAt: {
      base: 'تاريخ المتابعة يجب أن يكون تاريخًا صالحًا',
    },
  },
};
const getMessages = (lang = 'en') => {
    return messages[lang] || messages.en;
};
module.exports = getMessages;
