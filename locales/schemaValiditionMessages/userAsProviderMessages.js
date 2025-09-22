const messages = {
    en: {
        cityId: "City is required",
        areaId: "Area is required",
        whatsAppNumber: "WhatsApp Number is required",
        details: "Details is required",
        categoryCenterId: "center is required",
        subCategoryCenterId: "center category is required",
        tradeRegisterNumber: "Trade Register Number is required",
        userName: "Username is required",
        email: "Email is required",
        nationalId: "national Id required",
        locationRequired: "Location is required",
        locationType: "Location type must be 'Point'",
        coordinatesRequired: "Coordinates are required",
        coordinateNumber: "Each coordinate must be a number",
        coordinatesLength: "Coordinates must contain exactly [longitude, latitude]",
    },
    ar: {
        cityId: "المدينه مطلوبة",
        areaId: "المنطقه مطلوبه",
        whatsAppNumber: "رقم الواتساب مطلوب",
        details: "التفاصيل مطلوبة",
        categoryCenterId: "المركز مطلوب",
        subCategoryCenterId: "قسم المركز مطلوب",
        tradeRegisterNumber: "رقم السجل التجاري مطلوب",
        userName: "اسم المستخدم مطلوب",
        email: "البريد الإلكتروني مطلوب",
        nationalId: "رقم الهويه مطلوب",
        locationRequired: "الموقع مطلوب",
        locationType: "نوع الموقع يجب أن يكون 'Point'",
        coordinatesRequired: "الإحداثيات مطلوبة",
        coordinateNumber: "كل إحداثي يجب أن يكون رقمًا",
        coordinatesLength: "الإحداثيات يجب أن تحتوي على [خط الطول, خط العرض] فقط",

    }
}
const getMessages = (lang = 'en') => {
    return messages[lang] || messages.en;
};
module.exports = getMessages;