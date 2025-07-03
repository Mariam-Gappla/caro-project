// validationMessages.js
const messages = {
  en: {
    userId: {
      "string.base": "User ID must be a string",
    },
    rentalOfficeId: {
      "string.base": "Rental Office ID must be a string",
    },
    orderId: {
      "required": "Order ID is required",
      "base": "Order ID must be a string"
    },
    type: {
      "required": "Notification type is required",
      "only": "Notification type must be one of: newOrder, statusChanged, review, ended"
    },
    title: {
      "required": "Title is required",
      "base": "Title must be a string"
    },
    message: {
      "required": "Message is required",
      "base": "Message must be a string"
    },
    isRead: {
      "base": "isRead must be a boolean"
    }
  },

  ar: {
     userId: {
      "base": "معرّف المستخدم يجب أن يكون نصًا",
    },
    rentalOfficeId: {
      "base": "معرّف مكتب التأجير يجب أن يكون نصًا",
    },
    orderId: {
      "required": "رقم الطلب مطلوب",
      "base": "رقم الطلب يجب أن يكون نصًا"
    },
    type: {
      "required": "نوع الإشعار مطلوب",
      "only": "نوع الإشعار يجب أن يكون: طلب جديد، تغيير حالة، تقييم، أو إنهاء"
    },
    title: {
      "required": "العنوان مطلوب",
      "base": "العنوان يجب أن يكون نصًا"
    },
    message: {
      "required": "الرسالة مطلوبة",
      "base": "الرسالة يجب أن تكون نصًا"
    },
    isRead: {
      "base": "القيمة isRead يجب أن تكون true أو false"
    }
  }
};

const getMessages = (lang = 'en') => {
    return messages[lang] || messages.en;
};

module.exports = getMessages;