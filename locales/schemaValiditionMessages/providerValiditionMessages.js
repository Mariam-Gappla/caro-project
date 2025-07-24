const messages = {
    en: {
      serviceProviderRequired: 'Service provider ID is required',
      serviceProviderString: 'Service provider ID must be a string',

      userRequired: 'User ID is required',
      userString: 'User ID must be a string',

      ratingRequired: 'Rating is required',
      ratingNumber: 'Rating must be a number',
      ratingMin: 'Rating must be at least 1',
      ratingMax: 'Rating must not exceed 5',

      commentString: 'Comment must be a string',

      orderIdRequired: 'Order ID is required',
      orderIdString: 'Order ID must be a string',
    },

    ar: {
      serviceProviderRequired: 'مطلوب رقم معرف مقدم الخدمة',
      serviceProviderString: 'رقم مقدم الخدمة يجب أن يكون نصًا',

      userRequired: 'مطلوب رقم معرف المستخدم',
      userString: 'رقم المستخدم يجب أن يكون نصًا',

      ratingRequired: 'مطلوب تقييم',
      ratingNumber: 'يجب أن يكون التقييم رقمًا',
      ratingMin: 'أقل تقييم هو 1',
      ratingMax: 'أقصى تقييم هو 5',

      commentString: 'يجب أن يكون التعليق نصًا',

      orderIdRequired: 'مطلوب معرف الطلب',
      orderIdString: 'معرف الطلب يجب أن يكون نصًا',
    }
}
const getMessages = (lang = 'en') => {
    return messages[lang] || messages.en;
};

module.exports = getMessages;