const messages = {
  en: {
    content: {
      base: "Comment must be a text",
      empty: "Comment cannot be empty",
      min: "Comment must contain at least one character",
      max: "Comment cannot exceed 500 characters",
      required: "Comment is required"
    },
    tweetId: {
      base: "Tweet ID must be a string",
      required: "Tweet ID is required"
    }
  },

  ar: {
    content: {
      base: "التعليق يجب أن يكون نصًا",
      empty: "التعليق لا يمكن أن يكون فارغًا",
      min: "التعليق يجب أن يحتوي على حرف واحد على الأقل",
      max: "التعليق لا يمكن أن يزيد عن 500 حرف",
      required: "التعليق مطلوب"
    },
    tweetId: {
      base: "معرّف التويت يجب أن يكون نصًا",
      required: "معرّف التويت مطلوب"
    }
  }
};
const getMessages = (lang = 'en') => {
    return messages[lang] || messages.en;
};
module.exports = getMessages;
