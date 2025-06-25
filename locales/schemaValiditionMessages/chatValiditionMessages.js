// validations/messages.js
const messages = {
  en: {
    from: {
      'string.base': 'Sender must be a string',
      'any.required': 'Sender is required'
    },
    to: {
      'string.base': 'Receiver must be a string',
      'any.required': 'Receiver is required'
    },
    message: {
      'string.base': 'Message must be a string',
      'any.required': 'Message content is required'
    }
  },

  ar: {
    from: {
      'string.base': 'المُرسل يجب أن يكون نصًا',
      'any.required': 'حقل المُرسل مطلوب'
    },
    to: {
      'string.base': 'المستلم يجب أن يكون نصًا',
      'any.required': 'حقل المستلم مطلوب'
    },
    message: {
      'string.base': 'الرسالة يجب أن تكون نصًا',
      'any.required': 'محتوى الرسالة مطلوب'
    }
  }
};
const getMessages = (lang = 'en') => {
    return messages[lang] || messages.en;
};
module.exports = getMessages;
