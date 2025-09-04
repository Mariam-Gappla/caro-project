const messages = {
  en: {
    centerId: {
      base: 'center ID must be a string',
      required: 'center ID is required',
    },
    followedAt: {
      base: 'Followed date must be a valid date',
    },
  },
  ar: {
    centerId: {
      base: 'معرف المركز يجب أن يكون نصًا',
      required: 'معرف المركز مطلوب',
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
