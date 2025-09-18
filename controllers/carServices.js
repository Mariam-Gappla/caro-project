const CarServices=require("../models/carServices");
const addCarServices=async(req,res,next)=>{
    try{
        const lang=req.headers["accept-language"]||"en";
        const{nameEn,nameAr}=req.body;
        if(!nameEn || !nameAr){
            return res.status(400).send({
                status:false,
                code:400,
                message:lang==="en"?"serviceName required in arabic and english":"اسم الخدمة مطلوب بالعربية والانجليزية"
            });
        }
        const existingService=await CarServices.findOne({"name.en":nameEn});
        if(existingService){
            return res.status(400).send({
                status:false,
                code:400,
                message:lang==="en"?"serviceName already exists":"اسم الخدمة موجود بالفعل"
            });
        }
        await CarServices.create({name:{en:nameEn,ar:nameAr}});
        return res.status(200).send({
            status:true,
            code:200,
            message:lang==="en"?"service added successfully":"تمت إضافة الخدمة بنجاح"
        });
    }catch(error){
        next(error);
    }
};
const getServices=async(req,res,next)=>{
    try{
        const lang=req.headers["accept-language"]||"en";
        const services=await CarServices.find({});
        const formatesServices=services.map(service=>{
            return{
                id:service._id,
                text:lang==="en"?service.name.en:service.name.ar
            };
        });
            
        return res.status(200).send({
            status:true,
            code:200,
            message:lang==="en"?"services retrieved successfully":"تم استرجاع الخدمات بنجاح",
            data:formatesServices
        });
    }catch(error){
        next(error);
    }
};
module.exports={addCarServices,getServices};