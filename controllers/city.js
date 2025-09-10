const City = require("../models/city");
const addCity = async (req, res, next) => {
    try {
        const { nameAr, nameEn} = req.body; // { name: {ar,en}, cityId }
        const lang = req.headers["accept-language"] || "en";
        if(!nameAr || !nameEn){
            return res.status(400).send({
                status: false,
                code: 400,
                message: lang === "ar" ? "اسم المدينه باللغتين مطلوب" : "City name in both languages is required"
            });
        }
        // تحقق من التكرار داخل نفس المدينة
        const existingCity = await City.findOne({
            $or: [{ "name.ar": nameAr }, { "name.en": nameEn }]
        });

        if (existingCity) {
            return res.status(400).send({
                status: false,
                code: 400,
                message: lang === "ar" ? "المدينه موجوده بالفعل": "City already exists"
            });
        }

        await City.create({ name: { ar: nameAr, en: nameEn }});
        return res.status(200).send({
            status: true,
            code: 200,
            message: lang === "ar" ? "تم إضافة المنطقة بنجاح" : "City added successfully",
        });
    } catch (err) {
        next(err);
    }
};
const getCities = async (req, res, next) => {
    try {
        const lang = req.headers['accept-language'] || 'en';
        const cities = await City.find({});
        // رجّع البيانات مع اسم المنطقة حسب اللغة المطلوبة
        const formattedCities = cities.map(city => ({
            id: city._id,
            text: city.name[lang] || city.name.en  // fallback للإنجليزي لو اللغة مش موجودة
        }));
        return res.status(200).send({
            status: true,
            code: 200,
            message: lang === "ar" ? "تم جلب المدن بنجاح" : "cities fetched successfully",
            areas: formattedCities
        });
    }
    catch (err) {
        next(err)
    }
}
module.exports = {
    addCity,
    getCities
}