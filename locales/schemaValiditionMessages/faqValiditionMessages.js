const messages = {
  en: {
    requiredQuestionEn: "Question in English is required",
    requiredQuestionAr: "Question in Arabic is required",
    requiredAnswerEn: "Answer in English is required",
    requiredAnswerAr: "Answer in Arabic is required",
  },
  ar: {
    requiredQuestionEn: "السؤال بالإنجليزية مطلوب",
    requiredQuestionAr: "السؤال بالعربية مطلوب",
    requiredAnswerEn: "الإجابة بالإنجليزية مطلوبة",
    requiredAnswerAr: "الإجابة بالعربية مطلوبة",
  },
};
const getMessages = (lang = 'en') => {
  return messages[lang] || messages.en;
};

module.exports = getMessages;