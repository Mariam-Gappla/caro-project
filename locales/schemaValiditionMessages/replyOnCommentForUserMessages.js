const messages = {
  en: {
    userId: {
      required: "User ID is required",
      invalid: "User ID is not valid",
      base: "User ID must be a string",
    },
    postId: {
      required: "Tweet ID is required",
      invalid: "Tweet ID is not valid",
      base: "Tweet ID must be a string",
    },
    commentId: {
      required: "Comment ID is required",
      invalid: "Comment ID is not valid",
      base: "Comment ID must be a string",
    },
    content: {
      empty: "Reply content cannot be empty",
      required: "Reply content is required",
      base: "Reply content must be a string",
      min: "Reply content must contain at least one character",
    }
  },

  ar: {
    userId: {
      required: "رقم المستخدم مطلوب",
      invalid: "رقم المستخدم غير صالح",
      base: "رقم المستخدم يجب أن يكون نصًا",
    },
    postId: {
      required: "رقم التغريدة مطلوب",
      invalid: "رقم التغريدة غير صالح",
      base: "رقم التغريدة يجب أن يكون نصًا",
    },
    commentId: {
      required: "رقم التعليق مطلوب",
      invalid: "رقم التعليق غير صالح",
      base: "رقم التعليق يجب أن يكون نصًا",
    },
    content: {
      empty: "محتوى الرد لا يمكن أن يكون فارغًا",
      required: "محتوى الرد مطلوب",
      base: "محتوى الرد يجب أن يكون نصًا",
      min: "محتوى الرد يجب أن يحتوي على حرف واحد على الأقل",
    }
  }
};
const getMessages = (lang = 'en') => {
    return messages[lang] || messages.en;
};
module.exports = getMessages;
