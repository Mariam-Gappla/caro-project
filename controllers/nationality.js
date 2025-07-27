const nationality= require("../models/nationality");
const nationalitySchema=require("../validation/nationality");
const addNationality = async (req, res, next) => {
  try {
    const { name } = req.body;
    const lang = req.headers['accept-language'] || 'en';

    // Validate input
    const { error } = nationalitySchema(lang).validate(req.body);
    if (error) {
      return res.status(400).send({
        code: 400,
        status: false,
        message: error.details[0].message,
      });
    }

    // Check if nationality already exists
    const existingNationality = await nationality.findOne({ name: name.trim() });
    if (existingNationality) {
      return res.status(400).send({
        code: 400,
        status: false,
        message:
          lang === 'en'
            ? 'This nationality already exists'
            : 'هذه الجنسية موجودة بالفعل',
      });
    }

    // Create new nationality
    await nationality.create({ name: name.trim() });

    return res.status(200).json({
      code: 200,
      status: true,
      message:
        lang === 'en'
          ? 'Nationality added successfully'
          : 'تم إضافة الجنسية بنجاح',
    });
  } catch (err) {
    next(err);
  }
};
const getNationality = async (req, res, next) => {
  try {
    const lang = req.headers['accept-language'] || 'en';

    // 1. إحضار كل البيانات بدون pagination
    const nationalities = await nationality.find({}, { _id: 1, name: 1 });

    // 2. تعديل شكل البيانات
    const formatted = nationalities.map((item) => ({
      id: item._id,
      text: item.name
    }));

    // 3. إرسال الـ response
    res.status(200).send({
      code: 200,
      status: true,
      message:
        lang === 'en'
          ? 'Nationalities retrieved successfully'
          : 'تم استرجاع الجنسيات بنجاح',
      data: formatted
      
    });
  } catch (err) {
    next(err);
  }
};


module.exports = { addNationality,getNationality };