const carModel = require("../models/carModel");
const addModel=async(req,res,next)=>{
 try {
        const lang = req.headers['accept-language'] || 'en';
        const { model } = req.body;
        await carModel.create({
            modelName: model
        });
        return res.send({
            status: true,
            code: 200,
            message: lang == "ar" ? "تم اضافه اسم السياره بنجاح" : "car name added successfully"
        })


    }
    catch (error) {
        next(error)
    }
}
const getModels = async (req, res, next) => {
  try {
    const lang = req.headers['accept-language'] || 'en';

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const totalCount = await carModel.countDocuments();

    // جلب البيانات ثم تحويل الشكل
    const modelsRaw = await carModel.find().skip(skip).limit(limit);

    const models = modelsRaw.map((m) => ({
      id: m._id,
      text: m.modelName // ← غيّري 'name' لو عندك اسم مختلف للحقل
    }));

    return res.send({
      status: true,
      code: 200,
      message: lang === "en"
        ? "Your request has been completed successfully"
        : "تمت معالجة الطلب بنجاح",
      data: {
        models,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalCount / limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports={
   addModel,
    getModels
}