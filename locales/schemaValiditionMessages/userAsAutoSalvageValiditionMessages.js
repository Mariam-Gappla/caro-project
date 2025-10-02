const messages = {
    en: {
        username: {
            "string.base": "Username must be text",
            "string.empty": "Username is required",
            "string.min": "Username must be at least 3 characters",
            "string.max": "Username cannot exceed 30 characters",
            "any.required": "Username is required",
        },
        city: {
            "string.base": "City must be text",
            "string.empty": "City is required",
            "any.required": "City is required",
        },
        service: {
            "any.required": "Service is required",
            "string.base": "Service must be text",
            "array.base": "Service must be a list of text",
        },
        brand: {
            "array.base": "Brand must be a list",
            "array.min": "At least one brand is required",
            "any.required": "Brand list is required",
        },
    },
    ar: {
        username: {
            "string.base": "اسم المستخدم لازم يكون نص",
            "string.empty": "اسم المستخدم مطلوب",
            "string.min": "اسم المستخدم لازم يكون على الأقل 3 حروف",
            "string.max": "اسم المستخدم لا يمكن أن يتجاوز 30 حرف",
            "any.required": "اسم المستخدم مطلوب",
        },
        city: {
            "string.base": "المدينة لازم تكون نص",
            "string.empty": "المدينة مطلوبة",
            "any.required": "المدينة مطلوبة",
        },
        service: {
            "any.required": "الخدمة مطلوبة",
            "string.base": "الخدمة لازم تكون نص",
            "array.base": "الخدمة لازم تكون قائمة من النصوص",
        },
        brand: {
            "array.base": "الماركة لازم تكون قائمة",
            "array.min": "لازم تدخل ماركة واحدة على الأقل",
            "any.required": "قائمة الماركات مطلوبة",
        },
    }
};
const getMessages = (lang = 'en') => {
    return messages[lang] || messages.en;
};
module.exports = getMessages;