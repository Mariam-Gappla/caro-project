const messages = {
    ar: {
        images: "يجب إضافة صورة واحدة على الأقل",
        title: "العنوان مطلوب",
        description: "الوصف مطلوب",
        mainCategoryId: "المجموعة الرئيسية مطلوبة",
        subCategoryId: "المجموعة الفرعية مطلوبة",
        userId: "معرف المستخدم مطلوب",
        location: {
            lat: "خط العرض مطلوب ويجب أن يكون رقم",
            long: "خط الطول مطلوب ويجب أن يكون رقم"
        },
        priceType: {
            only: "نوع السعر يجب أن يكون إما ثابت أو قابل للتفاوض أو الأفضل",
            required: "نوع السعر مطلوب",
        },
        price: "السعر يجب أن يكون رقمًا",
        deposit: "العربون يجب أن يكون رقمًا",
        contactType: {
            base: "نوع التواصل يجب أن يكون نصًا",
            only: "نوع التواصل يجب أن يكون إما واتساب أو اتصال أو محادثة داخل التطبيق",
            required: "نوع التواصل مطلوب",
        },
        contactValue: {
            base: "وسيلة التواصل يجب أن تكون نصًا",
            required: "وسيلة التواصل مطلوبة عند اختيار واتساب أو اتصال",
            unknown: "لا يمكن إرسال وسيلة تواصل عند اختيار محادثة داخل التطبيق",
        },
        city: {
            required: "المدينة مطلوبة",
            string: "المدينة يجب أن تكون نصًا"
        },
        area: {
            required: "المنطقة مطلوبة",
            string: "المنطقة يجب أن تكون نصًا"
        },
    },
    en: {
        images: "At least one image is required",
        title: "Title is required",
        description: "Description is required",
        mainCategoryId: "Main category is required",
        subCategoryId: "Sub category is required",
        userId: "User ID is required",
        location: {
            lat: "Latitude is required and must be a number",
            long: "Longitude is required and must be a number"
        },
        priceType: {
            only: "Price type must be either fixed, negotiable, or best",
            required: "Price type is required",
        },
        price: "Price must be a number",
        deposit: "Deposit must be a number",
        contactType: {
            base: "Contact type must be a string",
            only: "Contact type must be either WhatsApp, Call, or In-app Chat",
            required: "Contact type is required",
        },
        contactValue: {
            base: "Contact value must be a string",
            required: "Contact value is required when choosing WhatsApp or Call",
            unknown: "Contact value cannot be provided when choosing In-app Chat",
        },
        city: {
            required: "City is required",
            string: "City must be a string"
        },
        area: {
            required: "Area is required",
            string: "Area must be a string"
        },
    }
}
const getMessages = (lang = 'en') => {
    return messages[lang] || messages.en;
};

module.exports = getMessages;