const messages= {
  en: {
    required: 'Videos are required',
    length: 'Exactly 3 videos must be provided',
    urlRequired: 'Each video must have a URL',
    urlInvalid: 'Each URL must be a valid link',
  },
  ar: {
    required: 'يجب إدخال مقاطع الفيديو',
    length: 'يجب إدخال 3 فيديوهات فقط',
    urlRequired: 'يجب إدخال رابط لكل فيديو',
    urlInvalid: 'يجب أن يكون الرابط صحيحًا لكل فيديو',
  },
};
const getMessages = (lang = 'en') => {
    return messages[lang] || messages.en;
};
module.exports=getMessages