const MainCategory = require("../models/mainCategory");
const allMainCategories = async (req, res, next) => {
    try {
        const lang = req.headers["accept-language"] || "ar";
        const mainCategories = await MainCategory.find({});
       const formatedCategory= mainCategories.map((cat)=>{
        return {id:cat._id,name:cat.name[lang]}
        })
        return res.status(200).send({
            code: 200,
            status: true,
            message: lang == "ar" ? "تم جلب الاقسام بنجاح" : "Categories fetched successfully",
            data: formatedCategory
        })
    }
    catch (error) {
        next(error)
    }
}
const addMainCategory = async (req, res, next) => {
    try {
        const lang = req.headers["accept-language"] || "ar";
        const { nameEn,nameAr } = req.body;
        if(!nameEn || !nameAr){
            return res.status(400).send({
                code: 400,
                status: false,
                message: lang=="ar"?"اسم القسم باللغه العربيه والانجليزيه مطلوب":"Category name in both English and Arabic is required",
            })
        }
        await MainCategory.create({
            name: {en:nameEn,ar:nameAr}
        });
        return res.status(200).send({
            code: 200,
            status: true,
            message: lang=="ar"?"تم اضافه القسم بنجاح":"Category added successfully",
        })

    }
    catch (error) {
        next(error)
    }
}
module.exports = {
    allMainCategories,
    addMainCategory,
}