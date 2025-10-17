const { validateMembership } = require("../validation/membershipValidition");
const Membership = require("../models/memberShip");
const addMembership = async (req, res, next) => {
  try {
    const lang = req.headers["accept-language"] || "en";
    console.log(req.body);
    const { titleEn, titleAr, benefitsEn, benefitsAr, termsEn, termsAr } = req.body;
    req.body.title = { en: titleEn, ar: titleAr };
    req.body.benefits = {
      en: Array.isArray(benefitsEn)
        ? [benefitsEn]
        : benefitsEn?.split(",").map((item) => item.trim()).filter(Boolean),
      ar: Array.isArray(benefitsAr)
        ? [benefitsAr]
        : benefitsAr?.split(",").map((item) => item.trim()).filter(Boolean),
    };

    req.body.terms = {
      en: Array.isArray(termsEn)
        ? [termsEn]
        : termsEn?.split(",").map((item) => item.trim()).filter(Boolean),
      ar: Array.isArray(termsAr)
        ? [termsAr]
        : termsAr?.split(",").map((item) => item.trim()).filter(Boolean),
    };

    delete req.body.titleEn;
    delete req.body.titleAr;
    delete req.body.benefitsEn;
    delete req.body.benefitsAr;
    delete req.body.termsEn;
    delete req.body.termsAr;
    const { error } = validateMembership(lang).validate(req.body);
    if (error) {
      return res.status(400).send({
        status: false,
        code: 400,
        message: error.details[0].message
      });
    }
    await Membership.create({ ...req.body });
    return res.status(200).send({
      status: true,
      code: 200,
      message: lang === "ar" ? "تم إضافة العضوية بنجاح" : "Membership added successfully"
    })
    // save membership...
  } catch (err) {
    next(err);
  }
};
const getMemberships = async (req, res, next) => {
  try {
    const lang = req.headers["accept-language"] === "ar" ? "ar" : "en";
    const memberships = await Membership.find();

    // نحول البيانات لتعرض اللغة المطلوبة فقط
    const formatted = memberships.map((m) => ({
      _id: m._id,
      title: m.title[lang],
      benefits: m.benefits[lang],
      terms: m.terms[lang],
      createdAt: m.createdAt,
      updatedAt: m.updatedAt,
    }));

    res.status(200).send({
      status: true,
      code: 200,
      message: lang === "ar" ? "تم استرجاع العضويات بنجاح" : "Memberships retrieved successfully",
      data: formatted,
    });
  } catch (err) {
    next(err);
  }
};
module.exports = {
  addMembership,
  getMemberships
}