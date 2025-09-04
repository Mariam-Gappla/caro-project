const SubCategoryCenter= require("../models/subCategoryCenter");
const addSubCategoryCenter=async(req,res,next)=>{
    try{
        const lang=req.headers["accept-language"] || "en";
        const {nameEn,nameAr,mainCategoryCenterId}=req.body;
        if(!nameEn || !nameAr || !mainCategoryCenterId){
            return res.status(400).send({
                status:false,
                code:400,
                message:lang==="en"?"sub category name in english, arabic and main category id are required":"اسم التصنيف الفرعي بالانجليزي والعربي ومعرف التصنيف الرئيسي مطلوب"
            });
        }
        const existingCategory=await SubCategoryCenter.findOne({$or:[{"name.en":nameEn},{"name.ar":nameAr}]});
        if(existingCategory){
            return res.status(400).send({
                status:false,
                code:400,
                message: lang==="en"?"sub category name already exists":"اسم التصنيف الفرعي موجود بالفعل"
            });
        }
        await SubCategoryCenter.create({name:{en:nameEn,ar:nameAr},mainCategoryCenterId});
        return res.status(200).send({
            status:true,
            code:200,
            message:lang==="en"?"sub category created successfully":"تم إنشاء التصنيف الفرعي بنجاح"
        });
    }
    catch(err){
        next(err);
    }
}
const getAllSubCategoryCenter=async(req,res,next)=>{
    try{
        const lang=req.headers["accept-language"] || "en";
        const mainCategoryCenterId=req.params.id;
        const subCategories=await SubCategoryCenter.find({mainCategoryCenterId});
        const formattedCategories=subCategories.map(cat=>({id:cat._id,name:cat.name[lang]}));
        return res.status(200).send({
            status:true,
            code:200,
            message:lang==="en"?"sub categories retrieved successfully":"تم استرجاع التصنيفات الفرعية بنجاح",
            data:formattedCategories
        });
    }
    catch(err){
        next(err);
    }
}
module.exports={
    addSubCategoryCenter,
    getAllSubCategoryCenter
};
