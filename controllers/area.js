const Area = require("../models/area");
const addArea = async (req, res, next) => {
    try {
        const { nameAr, nameEn, cityId } = req.body; // { name: {ar,en}, cityId }
        const lang = req.headers["accept-language"] || "en";
        if(!cityId){
            return res.status(400).send({
                status: false,
                code: 400,
                message: lang === "ar" ? "معرف المدينة مطلوب" : "City ID is required"
            });
        }
        if(!nameAr || !nameEn){
            return res.status(400).send({
                status: false,
                code: 400,
                message: lang === "ar" ? "اسم المنطقة باللغتين مطلوب" : "Area name in both languages is required"
            });
        }
        // تحقق من التكرار داخل نفس المدينة
        const existingArea = await Area.findOne({
            cityId,
            $or: [{ "name.ar": nameAr }, { "name.en": nameEn }]
        });

        if (existingArea) {
            return res.status(400).send({
                status: false,
                code: 400,
                message: lang === "ar" ? "المنطقة موجودة بالفعل في هذه المدينة" : "Area already exists in this city"
            });
        }

        await Area.create({ name: { ar: nameAr, en: nameEn }, cityId });
        return res.status(200).send({
            status: true,
            code: 200,
            message: lang === "ar" ? "تم إضافة المنطقة بنجاح" : "Area added successfully",
        });
    } catch (err) {
        next(err);
    }
};
const getArea = async (req, res, next) => {
    try {
        const lang = req.headers['accept-language'] || 'en';
        const cityId = req.params.cityId;
        const areas = await Area.find({ cityId });
        // رجّع البيانات مع اسم المنطقة حسب اللغة المطلوبة
        const formattedAreas = areas.map(area => ({
            id: area._id,
            text: area.name[lang] || area.name.en  // fallback للإنجليزي لو اللغة مش موجودة
        }));
        return res.status(200).send({
            status: true,
            code: 200,
            message: lang === "ar" ? "تم جلب المناطق بنجاح" : "Areas fetched successfully",
            areas: formattedAreas
        });
    }
    catch (err) {
        next(err)
    }
}
module.exports = {
    addArea,
    getArea
}