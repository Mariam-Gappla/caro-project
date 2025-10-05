const Advantage = require("../models/advantages");
const addAdvantage = async (req, res, next) => {
    try {
        const { nameAr, nameEn} = req.body; 
        const lang = req.headers["accept-language"] || "en";
        if(!nameAr || !nameEn){
            return res.status(400).send({
                status: false,
                code: 400,
                message: lang === "ar" ? "الميزه باللغتين مطلوب" : "Advantage name in both languages is required"
            });
        }
        // تحقق من التكرار داخل نفس المدينة
        const existingAdvantage = await Advantage.findOne({
            $or: [{ "name.ar": nameAr }, { "name.en": nameEn }]
        });

        if (existingAdvantage) {
            return res.status(400).send({
                status: false,
                code: 400,
                message: lang === "ar" ?"الميزه موجوده بالفعل" : "Advantage already exists"
            });
        }

        await Advantage.create({ name: { ar: nameAr, en: nameEn }});
        return res.status(200).send({
            status: true,
            code: 200,
            message: lang === "ar" ? "تم إضافة الميزه بنجاح" : "Advantage added successfully",
        });
    } catch (err) {
        next(err);
    }
};
const getAdvantage = async (req, res, next) => {
    try {
        const lang = req.headers['accept-language'] || 'en';
        const advantages = await Advantage.find({});
        // رجّع البيانات مع اسم المنطقة حسب اللغة المطلوبة
        const formattedAdvantages = advantages.map(adv => ({
            id: adv._id,
            text: adv.name[lang]  
        }));
        return res.status(200).send({
            status: true,
            code: 200,
            message: lang === "ar" ? "تم جلب المميزات بنجاح" : "Advantages fetched successfully",
            advantages: formattedAdvantages
        });
    }
    catch (err) {
        next(err)
    }
}
module.exports = {
    addAdvantage,
    getAdvantage
}