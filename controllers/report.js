const Report=require("../models/report");
const reportSchema=require("../validation/report");
const addReport=async(req,res,next)=>{
    try {
        const lang=req.headers["accept-language"] || "en";
        const userId=req.user.id;
        console.log(userId)
        req.body.userId=userId;
        const {error}=reportSchema(lang).validate(req.body);
        if(error){
            return res.status(400).send({
                status:false,
                code:400,
                message:error.details[0].message
            });
        }
        const {entityId,entityType,reason, isViolation}=req.body;
        const existingReport=await Report.findOne({userId,entityId,entityType});
        if(existingReport){
            return res.status(400).send({
                status:false,
                code:400,
                message: lang==="ar" ? "لقد قمت بالإبلاغ عن هذا المحتوى مسبقاً" : "You have already reported this content"
            });
        }
        await Report.create({userId,entityId,entityType,reason,isViolation});
       
        return res.status(200).send({
            status:true,
            code:200,
            message: lang==="ar" ? "تم تقديم البلاغ بنجاح" : "Report submitted successfully",
        });
    } catch (err) {
        next(err);
    }
}
module.exports={
    addReport
}