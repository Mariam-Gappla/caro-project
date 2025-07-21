const CarName = require("../models/carName")
const addName = async (req, res, next) => {
    try {
        const lang = req.headers['accept-language'] || 'en';
        const { name } = req.body;
        await CarName.create({
            carName: name
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

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const totalCount = await CarName.countDocuments();
    const rawNames = await CarName.find().skip(skip).limit(limit);

    // تغيير شكل النتائج
    const names = rawNames.map((n) => ({
      id: n._id,
      text: n.carName, // لو اسم الحقل مختلف غيره هنا
    }));

    return res.send({
      status: true,
      code: 200,
      message:
        lang === "en"
          ? "Your request has been completed successfully"
          : "تمت معالجة الطلب بنجاح",
      data: {
        names,
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

module.exports = {
    addName,
    getNames
}