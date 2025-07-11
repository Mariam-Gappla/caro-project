const messages = {
  ar: {
    content: {
      base: 'المحتوى يجب أن يكون نصًا',
      max: 'لا يمكن أن يزيد المحتوى عن 280 حرفًا',
      required: 'المحتوى مطلوب'
    },
    title: {
    base: "يجب أن يكون العنوان نصًا",
    required: "العنوان مطلوب"
  },
    userId: {
      base: 'معرف المستخدم يجب أن يكون نصًا',
      required: 'معرف المستخدم مطلوب',
      invalid: 'معرف المستخدم غير صالح'
    },
    likedBy: {
      arraybase: 'likedBy يجب أن تكون مصفوفة من معرفات المستخدمين',
      base: 'يجب أن تكون المعرفات داخل likedBy نصوصًا',
      invalid: 'معرف المستخدم داخل likedBy غير صالح'
    },
    createdAt: {
      base: 'تاريخ الإنشاء يجب أن يكون تاريخًا صالحًا'
    },
    images: {
      base: "كل صورة يجب أن تكون رابطًا نصيًا صحيحًا",
      arraybase: "يجب إرسال الصور كمصفوفة",
      max: "الحد الأقصى للصور هو 3 فقط"
    },
    video: {
      base: "رابط الفيديو يجب أن يكون نصًا صحيحًا"
    }
  },

  en: {
    content: {
      base: 'Content must be a string',
      max: 'Content cannot exceed 280 characters',
      required: 'Content is required'
    },
    title: {
      base: 'Title must be a string',
      empty: 'Title is required',
      required: 'Title is required',
    },
    userId: {
      base: 'User ID must be a string',
      required: 'User ID is required',
      invalid: 'Invalid User ID'
    },
    likedBy: {
      arraybase: 'likedBy must be an array of user IDs',
      base: 'Each likedBy item must be a string',
      invalid: 'Invalid user ID inside likedBy'
    },
    images: {
      base: "Each image must be a valid string URL",
      arraybase: "Images must be an array",
      max: "You can upload up to 3 images only"
    },
    video: {
      base: "Video must be a valid string URL"
    },
    createdAt: {
      base: 'Created date must be a valid date'
    }
  }
};
const getMessages = (lang = 'en') => {
  return messages[lang] || messages.en;
};
module.exports = getMessages;
