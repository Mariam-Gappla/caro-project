const MainCategoryCenter=require("../models/mainCategoryCenter");
const addMainCategoryCenter=async(req,res,next)=>{
    try{
        const lang=req.headers["accept-language"] || "en";
        const {nameEn,nameAr}=req.body;
        if(!nameEn || !nameAr){
            return res.status(400).send({
                status:false,
                code:400,
                message:lang==="en"?"main category name in english and arabic are required":"اسم التصنيف الرئيسي بالانجليزي والعربي مطلوب"
            });
        }
        const existingCategory=await MainCategoryCenter.findOne({$or:[{"name.en":nameEn},{"name.ar":nameAr}]});
        if(existingCategory){
            return res.status(400).send({
                status:false,
                code:400,
                message: lang==="en"?"main category name already exists":"اسم التصنيف الرئيسي موجود بالفعل"
            });
        }
        await MainCategoryCenter.create({name:{en:nameEn,ar:nameAr}});
        return res.status(200).send({
            status:true,
            code:200,
            message:lang==="en"?"main category created successfully":"تم إنشاء التصنيف الرئيسي بنجاح"
        });
    }
    catch(err){
        next(err);
    }
}
const getAllMainCategoryCenter=async(req,res,next)=>{
    try{
        const lang=req.headers["accept-language"] || "en";
        const mainCategories=await MainCategoryCenter.find({});
        const formattedCategories=mainCategories.map(cat=>({id:cat._id,name:cat.name[lang]}));
        return res.status(200).send({
            status:true,
            code:200,
            message:lang==="en"?"main categories retrieved successfully":"تم استرجاع التصنيفات الرئيسية بنجاح",
            data:formattedCategories
        });
    }
    catch(err){
        next(err);
    }
}
module.exports={
    addMainCategoryCenter,
    getAllMainCategoryCenter
};