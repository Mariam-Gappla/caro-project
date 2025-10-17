const Package= require("../models/packages.js") 
const { addPackageValidation }= require("../validation/packageValidition.js");
const addPackage = async (req, res, next) => {
  try {
    const lang = req.headers["accept-language"] || "en";
    const {titleEn, titleAr, duration, price } = req.body;
    req.body.title = { en: titleEn, ar: titleAr };
    delete req.body.titleEn;
    delete req.body.titleAr;
    const { error } = addPackageValidation(lang).validate(req.body);

    if (error) {
      return res.status(400).send({
        status: false,
        code:400,
        message: error.details[0].message
      });
    }
    await Package.create(req.body);
    res.status(200).send({
      status: true,
      code:200,
      message: lang === "ar" ? "تم إضافة الباقة بنجاح" : "Package added successfully",
    });
  } catch (err) {
    next(err);
  }
};
const getPackages = async (req, res, next) => {
  try {
    const lang = req.headers["accept-language"] || "en";
    const packages = await Package.find();

    const formatted = packages.map((p) => ({
      _id: p._id,
      title: p.title[lang],
      duration: p.duration,
      price: p.price,
    }));

    res.status(200).send({
      status: true,
      code:200,
      message: lang === "ar" ? "تم جلب الباقات بنجاح" : "Packages fetched successfully",
      data: formatted,
    });
  } catch (err) {
    next(err);
  }
};
module.exports = { addPackage, getPackages };