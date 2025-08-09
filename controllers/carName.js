const CarName = require("../models/carName")
const addName = async (req, res, next) => {
  try {
    const lang = req.headers['accept-language'] || 'en';
    const { name_en, name_ar } = req.body;

    if (!name_en || !name_ar) {
      return res.status(400).send({
        status: false,
        code: 400,
        message: lang == "ar" ? "Please provide car name in both languages" : "من فضلك دخل اسم العربيه باللغتيم العربيه والانجليزيه"
      });
    }

    await CarName.create({
      carName: { en: name_en, ar: name_ar }
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
const getNames = async (req, res, next) => {
  try {
    const lang = req.headers['accept-language'] || 'en';
    const rawNames = await CarName.find({});
    // تغيير شكل النتائج
    const names = rawNames.map((n) => ({
      id: n._id,
      text: lang === 'ar' ? n.carName.ar : n.carName.en
    }));

    return res.send({
      status: true,
      code: 200,
      message:
        lang === "en"
          ? "Your request has been completed successfully"
          : "تمت معالجة الطلب بنجاح",
      data: names

    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addName,
  getNames
}