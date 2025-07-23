const winsh = require("../models/winsh");
const tire = require("../models/tire");
const { winshSchema, winshImagesSchema } = require("../validation/winshValidition");
const { tireSchema, tireImagesSchema } = require("../validation/tireRefilling");
const path = require("path");
const fs = require("fs");
const saveImage = (file, folder = 'images') => {
  const fileName = `${Date.now()}-${file.originalname}`;
  const saveDir = path.join(__dirname, '..', folder);
  const filePath = path.join(saveDir, fileName);

  if (!fs.existsSync(saveDir)) {
    fs.mkdirSync(saveDir, { recursive: true });
  }

  fs.writeFileSync(filePath, file.buffer);
  return `/images/${fileName}`;
};
const submitWinchVerification = async (req, res, next) => {
  try {
    const lang = req.headers["accept-language"] || "en";
    const providerId = req.user.id;
    const role = req.user.role;

    if (role !== "serviceProvider") {
      return res.status(400).send({
        status: false,
        code: 400,
        message: lang === "en" ? "Not allowed for you" : "غير مسموح لك"
      });
    }

    // ✅ تحقق هل قدم بالفعل
    const existing = await winsh.findOne({ providerId });
    if (existing) {
      return res.status(400).send({
        status: false,
        code: 400,
        message:
          lang === "en"
            ? "You have already submitted a verification request."
            : "لقد قمت بالفعل بتقديم طلب تحقق.",
      });
    }

    // ✅ التحقق من البيانات
    const { error } = winshSchema(lang).validate({
      providerId,
      ...req.body
    });

    if (error) {
      return res.status(400).send({
        code: 400,
        status: false,
        message: error.details[0].message
      });
    }

    // ✅ إنشاء الطلب
    const verification = await winsh.create({
      providerId,
      fullName: req.body.fullName,
      nationality: req.body.nationality,
      nationalId: req.body.nationalId,
      birthDate: req.body.birthDate,
      email: req.body.email,
      iban: req.body.iban,
      bankAccountName: req.body.bankAccountName,
      serviceType: req.body.serviceType,
      winchType: req.body.winchType,
      carPlateNumber: req.body.carPlateNumber,
    });

    res.status(200).send({
      status: true,
      code: 200,
      message:
        lang === "en"
          ? "Verification request submitted successfully."
          : "تم إرسال طلب التحقق بنجاح",
    });

  } catch (error) {
    next(error);
  }
};
const uploadWinchImages = async (req, res, next) => {
  try {
    const lang = req.headers["accept-language"] || "en";
    const providerId = req.user.id;
    const role = req.user.role;
    const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
    const files = req.files;

    if (role !== "serviceProvider") {
      return res.status(400).send({
        status: false,
        code: 400,
        message: lang === "en" ? "Not allowed for you" : "غير مسموح لك",
      });
    }

    // تحقق أن الطلب موجود
    const existingWinch = await winsh.findOne({ providerId });
    if (!existingWinch) {
      return res.status(400).send({
        status: false,
        code: 400,
        message: lang === "en"
          ? "You must submit your verification details before uploading images."
          : "يجب إرسال بيانات التحقق أولًا قبل رفع الصور.",
      });
    }

    // ❌ تحقق إن الصور مش مرفوعة قبل كده
    const alreadyUploaded =
      existingWinch.profileImage ||
      existingWinch.nationalIdImage ||
      existingWinch.licenseImage ||
      existingWinch.carRegistrationImage ||
      existingWinch.carImage;

    if (alreadyUploaded) {
      return res.status(400).send({
        status: false,
        code: 400,
        message: lang === "en"
          ? "You have already uploaded your images."
          : "لقد قمت برفع الصور بالفعل.",
      });
    }

    // تجهيز الروابط المؤقتة للفحص
    const tempUrls = {
      profileImage: files?.profileImage?.[0] ? `${BASE_URL}/images/${files.profileImage[0].filename}` : "",
      nationalIdImage: files?.nationalIdImage?.[0] ? `${BASE_URL}/images/${files.nationalIdImage[0].filename}` : "",
      licenseImage: files?.licenseImage?.[0] ? `${BASE_URL}/images/${files.licenseImage[0].filename}` : "",
      carRegistrationImage: files?.carRegistrationImage?.[0] ? `${BASE_URL}/images/${files.carRegistrationImage[0].filename}` : "",
      carImage: files?.carImage?.[0] ? `${BASE_URL}/images/${files.carImage[0].filename}` : "",
    };

    // فحص الصور بـ Joi
    const { error } = winshImagesSchema(lang).validate(tempUrls);
    if (error) {
      return res.status(400).send({
        code: 400,
        status: false,
        message: error.details[0].message,
      });
    }

    // حفظ الروابط النهائية
    const savedUrls = {
      profileImage: files?.profileImage?.[0] ? BASE_URL + saveImage(files.profileImage[0]) : "",
      nationalIdImage: files?.nationalIdImage?.[0] ? BASE_URL + saveImage(files.nationalIdImage[0]) : "",
      licenseImage: files?.licenseImage?.[0] ? BASE_URL + saveImage(files.licenseImage[0]) : "",
      carRegistrationImage: files?.carRegistrationImage?.[0] ? BASE_URL + saveImage(files.carRegistrationImage[0]) : "",
      carImage: files?.carImage?.[0] ? BASE_URL + saveImage(files.carImage[0]) : "",
    };

    await winsh.updateOne({ providerId }, { $set: savedUrls });

    res.status(200).send({
      status: true,
      code: 200,
      message: lang === "en" ? "Images uploaded successfully" : "تم رفع الصور بنجاح",
      data: savedUrls,
    });
  } catch (error) {
    next(error);
  }
};
const uploadTireImages = async (req, res, next) => {
  try {
    const lang = req.headers["accept-language"] || "en";
    const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
    const files = req.files;
    const role = req.user.role;
    const providerId = req.user.id;

    if (role !== "serviceProvider") {
      return res.status(400).send({
        status: false,
        code: 400,
        message: lang === "en" ? "Not allowed for you" : "غير مسموح لك",
      });
    }

    // ✅ تحقق من وجود صورة مرفوعة مسبقًا
    const existing = await tire.findOne({ providerId });
    if (existing?.profileImage) {
      return res.status(400).send({
        status: false,
        code: 400,
        message: lang === "en"
          ? "You have already uploaded the image."
          : "لقد قمت برفع الصورة بالفعل.",
      });
    }

    // ✅ تجهيز الرابط المؤقت بدون حفظ فعلي
    const tempUrl = files?.profileImage?.[0]
      ? `${BASE_URL}/images/${files.profileImage[0].filename}`
      : "";

    // ✅ التحقق باستخدام Joi
    const { error } = tireImagesSchema(lang).validate({
      profileImage: tempUrl,
    });

    if (error) {
      return res.status(400).send({
        status: false,
        code: 400,
        message: error.details[0].message,
      });
    }

    // ✅ حفظ الصورة فعليًا بعد التحقق
    const savedImagePath = saveImage(files.profileImage[0]);
    const profileImageUrl = BASE_URL + savedImagePath;

    // ✅ تحديث السجل الموجود
    await tire.findOneAndUpdate(
      { providerId },
      {
        profileImage: profileImageUrl,
        ...(req.body.notes && { notes: req.body.notes }),
      },
      { new: true }
    );

    return res.status(200).send({
      status: true,
      code: 200,
      message:
        lang === "en"
          ? "Image uploaded and saved successfully"
          : "تم رفع الصورة بنجاح",
    });
  } catch (error) {
    next(error);
  }
};
const submitTireVerification = async (req, res, next) => {
  try {
    const providerId = req.user.id;
    const lang = req.headers['accept-language'] || 'en';
    const role = req.user.role;

    if (role !== "serviceProvider") {
      return res.status(400).send({
        status: false,
        code: 400,
        message: lang === "en" ? "Not allowed for you" : "غير مسموح لك"
      });
    }

    // ✅ التحقق من وجود تحقق سابق لنفس المزود
    const existingVerification = await tire.findOne({ providerId });
    if (existingVerification) {
      return res.status(400).send({
        status: false,
        code: 400,
        message: lang === "en"
          ? "You have already submitted your verification request."
          : "لقد قمت بإرسال طلب التحقق بالفعل.",
      });
    }

    // ✅ التحقق من البيانات باستخدام Joi
    const { error } = tireSchema(lang).validate({
      providerId,
      ...req.body
    });

    if (error) {
      return res.status(400).send({
        code: 400,
        status: false,
        message: error.details[0].message
      });
    }

    // ✅ إنشاء الطلب الجديد
    await tire.create({
      providerId,
      serviceType: req.body.serviceType,
      fullName: req.body.fullName,
      nationality: req.body.nationality,
      nationalId: req.body.nationalId,
      birthDate: req.body.birthDate,
      email: req.body.email,
      iban: req.body.iban,
      bankAccountName: req.body.bankAccountName,
    });

    return res.status(200).send({
      status: true,
      code: 200,
      message: lang === "en"
        ? "Verification request submitted successfully."
        : "تم إرسال طلبك بنجاح",
    });

  } catch (error) {
    next(error);
  }
};


module.exports = {
  submitWinchVerification,
  uploadWinchImages,
  uploadTireImages,
  submitTireVerification
}


















