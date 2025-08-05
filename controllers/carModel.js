const carModel = require("../models/carModel");
const carName = require('../models/carName');
const CarType = require('../models/carType');

const addModel = async (req, res,next) => {
  try {
    const { model, nameId, carTypeId } = req.body;
    const lang = req.headers['accept-language'] === 'ar' ? 'ar' : 'en';

    if (!model || !nameId || !carTypeId) {
      const message = lang === 'ar'
        ? 'الاسم، اسم السيارة، ونوع السيارة مطلوبين.'
        : 'Name, car name, and car type are required.';
      return res.status(400).send({ status: false,code:400, message });
    }

    const car = await carName.findOne({_id:nameId});
    if (!car) {
      const message = lang === 'ar'
        ? 'اسم السيارة غير موجود.'
        : 'Car brand not found.';
      return res.status(400).json({ code:400, status: false, message });
    }

    const type = await CarType.findOne({_id:carTypeId});
    if (!type) {
      const message = lang === 'ar'
        ? 'نوع السيارة غير موجود.'
        : 'Car type not found.';
      return res.status(400).send({ status: false,code:400 ,message });
    }

    const existingModel = await carModel.findOne({ name:model, carNameId:nameId, carTypeId:carTypeId });
    if (existingModel) {
      const message = lang === 'ar'
        ? 'هذا الموديل مضاف بالفعل لنفس الاسم والنوع.'
        : 'This model already exists for the selected car and type.';
      return res.status(400).send({ status: false,code:400, message });
    }

    const newModel = await carModel.create({ name:model, carNameId:nameId, carTypeId:carTypeId });
    const message = lang === 'ar'
      ? 'تم إضافة الموديل بنجاح.'
      : 'Model added successfully.';
    return res.status(200).send({ 
      status: true,
      code:200,
       message, 
      });

  } catch (err) {
    next(err)
  }
};
const getModels = async (req, res, next) => {
  try {
    const lang = req.headers['accept-language'] === 'ar' ? 'ar' : 'en';

    const { carNameId, carTypeId } = req.body;

    if (!carNameId|| !carTypeId) {
      const message = lang === 'ar'
        ? 'يجب إرسال اسم السيارة ونوع السيارة.'
        : 'Car name and car type are required.';
      return res.status(400).json({ status: false, code: 400, message });
    }

    const models = await carModel.find({ carNameId, carTypeId });

    const formattedModels = models.map(model => ({
      id: model._id,
      text: model.name
    }));

    const message = lang === 'ar'
      ? 'تم جلب الموديلات بنجاح.'
      : 'Models fetched successfully.';

    return res.status(200).json({
      status: true,
      code:200,
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