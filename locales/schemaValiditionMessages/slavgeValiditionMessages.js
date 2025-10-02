const messages = {
    en: {
        title: {
            "string.base": "Title must be text",
            "string.empty": "Title is required",
            "any.required": "Title is required",
        },
        details: {
            "string.base": "Details must be text",
            "string.empty": "Details are required",
            "any.required": "Details are required",
        },
        location: {
            "any.required": "Location is required",
            "object.base": "Location must be an object",
            "string.base": "Location type must be text",
            "any.only": "Location type must be 'Point'",
            "array.base": "Coordinates must be an array",
            "array.length": "Coordinates must contain exactly [longitude, latitude]",
            "number.base": "Coordinates must be numbers",
        },
        image: {
            "array.base": "Image must be a list",
            "array.min": "At least one image is required",
            "any.required": "Image is required",
            "string.base": "Each image must be text (URL or filename)",
        },
    },
    ar: {
        title: {
            "string.base": "العنوان لازم يكون نص",
            "string.empty": "العنوان مطلوب",
            "any.required": "العنوان مطلوب",
        },
        details: {
            "string.base": "التفاصيل لازم تكون نص",
            "string.empty": "التفاصيل مطلوبة",
            "any.required": "التفاصيل مطلوبة",
        },
        location: {
            "any.required": "الموقع مطلوب",
            "object.base": "الموقع لازم يكون كائن",
            "string.base": "نوع الموقع لازم يكون نص",
            "any.only": "نوع الموقع لازم يكون 'Point'",
            "array.base": "الإحداثيات لازم تكون قائمة",
            "array.length": "الإحداثيات لازم تكون [خط الطول, خط العرض]",
            "number.base": "الإحداثيات لازم تكون أرقام",
        },
        image: {
            "array.base": "الصور لازم تكون قائمة",
            "array.min": "لازم تضيف صورة واحدة على الأقل",
            "any.required": "الصور مطلوبة",
            "string.base": "كل صورة لازم تكون نص (لينك أو اسم ملف)",
        },
    }
};
const getMessages = (lang = 'ar') => {
    return messages[lang] || messages.ar;
};
module.exports=getMessages;

