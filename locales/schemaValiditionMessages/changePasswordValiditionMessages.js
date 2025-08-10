// utils/messages.js
const messages = {
  ar: {
      oldPasswordRequired: "كلمة المرور القديمة مطلوبة",
      oldPasswordEmpty: "كلمة المرور القديمة لا يمكن أن تكون فارغة",
      newPasswordRequired: "كلمة المرور الجديدة مطلوبة",
      newPasswordMin: "كلمة المرور الجديدة يجب أن تكون على الأقل 6 أحرف",
      confirmPasswordRequired: "تأكيد كلمة المرور مطلوب",
      confirmPasswordMismatch: "تأكيد كلمة المرور يجب أن يطابق كلمة المرور الجديدة"
  },
  en: {
      oldPasswordRequired: "Old password is required",
      oldPasswordEmpty: "Old password cannot be empty",
      newPasswordRequired: "New password is required",
      newPasswordMin: "New password must be at least 6 characters long",
      confirmPasswordRequired: "Confirm password is required",
      confirmPasswordMismatch: "Confirm password must match the new password"
  }
};

const getMessages = (lang = 'en') => {
  return messages[lang] || messages.en;
};
module.exports = getMessages;
