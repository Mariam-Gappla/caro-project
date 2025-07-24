const vehicle = require("../models/recoveryVehicleType");
const recoveryVehicleTypeSchema = require("../validation/vehicle")
const addVehicleType = async (req, res, next) => {
    try {
        const { vehicleName } = req.body;
        const lang = req.headers['accept-language'] || 'en';
        const { error } = recoveryVehicleTypeSchema(lang).validate(req.body);
        if (error) {
            return res.status(400).send({
                code: 400,
                status: false,
                message: error.details[0].message,
            });
        }
        // التحقق من وجود النوع مسبقًا
        const existingVehicle = await vehicle.findOne({ name: vehicleName.trim() });
        if (existingVehicle) {
            return res.status(400).send({
                code: 400,
                status: false,
                message:
                    lang === "en"
                        ? "This vehicle type already exists"
                        : "هذا النوع من المركبات موجود بالفعل",
            });
        }

        // إنشاء نوع المركبة
        const vehicleType = await vehicle.create({
            name: vehicleName.trim(),
        });

        // الاستجابة بالنجاح مع البيانات المُضافة
        return res.status(200).send({
            code: 200,
            status: true,
            message:
                lang === "en"
                    ? "Vehicle type added successfully"
                    : "تم إضافة نوع المركبة بنجاح"
        });

    } catch (err) {
        next(err);
    }
};

const getVehicleType = async (req, res, next) => {
  try {
    const lang = req.headers['accept-language'] || 'en';

    // قراءة page و limit من الـ query
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // عدد كل العناصر
    const total = await vehicle.countDocuments();

    // جلب العناصر مع pagination
    const vehicleTypes = await vehicle
      .find({}, { _id: 1, name: 1 })
      .skip(skip)
      .limit(limit);

    // تعديل شكل البيانات
    const formatted = vehicleTypes.map((item) => ({
      id: item._id,
      text: item.name,
    }));

    // إرسال الـ response
    res.status(200).json({
      code: 200,
      status: true,
      message:
        lang === 'en'
          ? 'Vehicle types retrieved successfully'
          : 'تم استرجاع أنواع المركبات بنجاح',
      data: {
       content: formatted,
       pagination: {
          page: page,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { addVehicleType, getVehicleType };