const messages = {
  en: {
    userId: {
      "any.required": "userId is required",
      "string.base": "userId must be a string",
    },
    entityId: {
      "any.required": "entityId is required",
      "string.base": "entityId must be a string",
    },
    entityType: {
      "any.required": "entityType is required",
      "any.only": "entityType must be either Post or Comment",
    },
    reason: {
      "any.required": "reason is required",
      "string.empty": "reason cannot be empty",
    },
    isViolation: {
      "any.required": "isViolation is required",
      "boolean.base": "isViolation must be true or false",
    },
  },

  ar: {
    userId: {
      "any.required": "معرّف المستخدم مطلوب",
      "string.base": "معرّف المستخدم يجب أن يكون نص",
    },
    entityId: {
      "any.required": "معرّف العنصر مطلوب",
      "string.base": "معرّف العنصر يجب أن يكون نص",
    },
    entityType: {
      "any.required": "نوع العنصر مطلوب",
      "any.only": "نوع العنصر يجب أن يكون إما منشور أو تعليق",
    },
    reason: {
      "any.required": "السبب مطلوب",
      "string.empty": "السبب لا يمكن أن يكون فارغ",
    },
    isViolation: {
      "any.required": "حقل المخالفة مطلوب",
      "boolean.base": "قيمة المخالفة يجب أن تكون صح أو خطأ",
    },
  },
};
const getMessages = (lang = 'en') => messages[lang] || messages.en;
module.exports = getMessages;