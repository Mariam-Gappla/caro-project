const messages ={
    en: {
        cityId: "City is required",
        whatsAppNumber: "WhatsApp Number is required",
        details: "Details is required",
        categoryCenterId: "center is required",
        subCategoryCenterId: "center category is required",
        tradeRegisterNumber: "Trade Register Number is required",
        userName: "Username is required",
        email: "Email is required",
    },
    ar:{
        cityId: "المدينه مطلوبة",
        whatsAppNumber: "رقم الواتساب مطلوب",
        details: "التفاصيل مطلوبة",
        categoryCenterId: "المركز مطلوب",
        subCategoryCenterId: "قسم المركز مطلوب",
        tradeRegisterNumber: "رقم السجل التجاري مطلوب",
        userName: "اسم المستخدم مطلوب",
        email: "البريد الإلكتروني مطلوب",

    }
}
const getMessages = (lang = 'en') => {
    return messages[lang] || messages.en;
};
module.exports = getMessages;