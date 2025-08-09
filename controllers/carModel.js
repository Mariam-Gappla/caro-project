const carModel = require("../models/carModel");
const carName = require('../models/carName');
const CarType = require('../models/carType');

const addModel = async (req, res, next) => {
  try {
    const lang = req.headers['accept-language'] === 'ar' ? 'ar' : 'en';
    const rentalOfficeId = req.user.id;
    const { typeId, model_en,model_ar } = req.body;

    if (!typeId || !model_ar || !model_en) {
      return res.status(400).send({
        status: false,
        code: 400,
        message: lang == "en" ? "Please provide nameId and model" : "من فضلك ادخل الموديل ومعرف الاسم"
      });
    }

    await carModel.create({
      rentalOfficeId,
      typeId,
      model:{
        en:model_en,
        ar:model_ar
      }
    });
    const message = lang === 'ar'
      ? 'تم إضافة الموديل بنجاح.'
      : 'Model added successfully.';
    return res.status(200).send({
      status: true,
      code: 200,
      message,
    });

  } catch (err) {
    next(err)
  }
};
const getModels = async (req, res, next) => {
  try {
    const lang = req.headers['accept-language'] === 'ar' ? 'ar' : 'en';

    const rentalOfficeId = req.user.id;
    const { typeId } = req.body;

    if (!typeId) {
      return res.status(400).send({
        status: false,
        code: 400,
        message: lang === 'ar' ? "الرجاء توفير معرف اسم السيارة" : "Please provide nameId"
      });
    }

    const carModels = await carModel.find({ rentalOfficeId, typeId });
    const formattedModels = carModels.map(model => ({
      id: model._id,
      text: lang === 'ar' ? model.model.ar : model.model.en
    }));

    const message = lang === 'ar'
      ? 'تم جلب الموديلات بنجاح.'
      : 'Models fetched successfully.';

    return res.status(200).send({
      status: true,
      code: 200,
      message,
      data: formattedModels
    });

  } catch (err) {
    next(err);
  }
};

module.exports = {
  addModel,
  getModels
}