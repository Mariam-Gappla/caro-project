const messages = {
  en: {
    userId: {
      "any.required": "User ID is required",
      "string.base": "User ID must be a string",
    },
    entityId: {
      "any.required": "Entity ID is required",
      "string.base": "Entity ID must be a string",
    },
    entityType: {
      "any.required": "Entity type is required",
      "any.only": "Entity type must be one of: Post, ShowRoomPosts, User",
    },
    rating: {
      "any.required": "Rating is required",
      "number.base": "Rating must be a number",
      "number.min": "Rating must be at least 1",
      "number.max": "Rating cannot be more than 5",
    },
    ques1: {
      "any.required": "Question 1 answer is required",
      "boolean.base": "Question 1 must be true or false",
    },
    ques2: {
      "any.required": "Question 2 answer is required",
      "boolean.base": "Question 2 must be true or false",
    },
    comment: {
      "string.base": "Comment must be a string",
    },
  },
  ar: {
    userId: {
      "any.required": "مطلوب إدخال معرف المستخدم",
      "string.base": "معرف المستخدم يجب أن يكون نص",
    },
    entityId: {
      "any.required": "مطلوب إدخال معرف الكيان",
      "string.base": "معرف الكيان يجب أن يكون نص",
    },
    entityType: {
      "any.required": "مطلوب إدخال نوع الكيان",
      "any.only": "نوع الكيان يجب أن يكون: Post أو ShowRoomPosts أو User",
    },
    rating: {
      "any.required": "مطلوب إدخال التقييم",
      "number.base": "التقييم يجب أن يكون رقم",
      "number.min": "أقل تقييم مسموح به هو 1",
      "number.max": "أعلى تقييم مسموح به هو 5",
    },
    ques1: {
      "any.required": "الإجابة على السؤال الأول مطلوبة",
      "boolean.base": "السؤال الأول يجب أن يكون نعم أو لا",
    },
    ques2: {
      "any.required": "الإجابة على السؤال الثاني مطلوبة",
      "boolean.base": "السؤال الثاني يجب أن يكون نعم أو لا",
    },
    comment: {
      "string.base": "التعليق يجب أن يكون نص",
    },
  },
};
const getMessages = (lang = "en") => messages[lang] || messages.en;

module.exports = getMessages;
