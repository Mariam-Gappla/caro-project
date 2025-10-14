const Service = require("../models/service");
const {saveImage} = require("../configration/saveImage");
const addService = async (req, res, next) => {
    try {
        const lang = req.headers["accept-language"] || "en";
        const mainCategoryId = req.params.id;
        const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
        const { nameEn, nameAr } = req.body;
        if (!nameEn || !nameAr) {
            return res.status(400).send({
                status: false,
                code: 400,
                message: lang == "en" ? "service name required in english and arabic" : "اسم الخدمه مطلوب بالعربى والانجليزى"
            })
        }
        const file = req.file;
        if (!file) {
            return res.status(200).send({
                status: false,
                code: 400,
                message: lang == "en" ? "service image required" : "صوره الخدمه مطلوبه"
            })
        }
        let imagePath = BASE_URL + saveImage(file)
        await Service.create({
            name: { en: nameEn, ar: nameAr },
           mainCategoryCenterId: mainCategoryId,
            image: imagePath
        })
        return res.status(200).send({
            status: true,
            code: 200,
            message: lang === "ar" ? "تم اضافه الخدمه بنجاح" : "service added successfully"
        });


    }
    catch (err) {
        next(err);
    }
}
const getServicesInCenter = async (req, res, next) => {
    try {
        const lang = req.headers["accept-language"] || "en";
        const centerId=req.params.id;
        const services=await Service.find({mainCategoryCenterId:centerId});
        const formatedServices=services.map((service)=>{
            return {
                id:service._id,
                text:service.name[lang],
                image:service.image
            }
        })
        return res.status(200).send({
            status:true,
            code:200,
            message:lang=="en"?"services retrieved successfully":"تم استرجاع الخدمات بنجاح",
            data:formatedServices
        })

    }
    catch {
        next(err)
    }
}
module.exports = { addService, getServicesInCenter }
