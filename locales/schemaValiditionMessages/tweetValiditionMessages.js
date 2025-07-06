const messages = {
  ar: {
    content: {
      'base': 'المحتوى يجب أن يكون نصًا',
      'max': 'لا يمكن أن يزيد المحتوى عن 280 حرفًا',
      'required': 'المحتوى مطلوب'
    },
    userId: {
      'base': 'معرف المستخدم يجب أن يكون نصًا',
      'required': 'معرف المستخدم مطلوب',
      'invalid': 'معرف المستخدم غير صالح'
    },
    likedBy: {
      'arraybase': 'likedBy يجب أن تكون مصفوفة من معرفات المستخدمين',
      'base': 'يجب أن تكون المعرفات داخل likedBy نصوصًا',
      'invalid': 'معرف المستخدم داخل likedBy غير صالح'
    },
    createdAt: {
      'base': 'تاريخ الإنشاء يجب أن يكون تاريخًا صالحًا'
    },
    image:{
       'base':"الصوره يجب ان تكون نصا"
    }
  },

  en: {
    content: {
      'string': 'Content must be a string',
      'string': 'Content cannot exceed 280 characters',
      'required': 'Content is required'
    },
     title: {
      'base': 'Title must be a string',
      'empty': 'Title is required',
      'required': 'Title is required',
    },
    userId: {
      'base': 'User ID must be a string',
      'required': 'User ID is required',
      'invalid': 'Invalid User ID'
    },
    likedBy: {
      'arraybase': 'likedBy must be an array of user IDs',
      'base': 'Each likedBy item must be a string',
      'invalid': 'Invalid user ID inside likedBy'
    },
    image:{
       'base':"image must be string"
    },
    createdAt: {
      'base': 'Created date must be a valid date'
    }
  }
};
const getMessages = (lang = 'en') => {
    return messages[lang] || messages.en;
};
module.exports = getMessages;
