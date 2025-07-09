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

    const verification = await winsh.create({
      providerId,
      fullName: req.body.fullName,
      nationality: req.body.nationality,
      nationalId: req.body.nationalId,
      birthDate: req.body.birthDate,
      email: req.body.email,
      iban: req.body.iban,
      bankAccountName: req.body.bankAccountName,
      winchType: req.body.winchType,
      carPlateNumber: req.body.carPlateNumber,
    });

    res.status(200).send({
      status: true,
      code: 200,
      message: lang === "en" ? "Verification request submitted successfully." : "تم ارسال طلبك بنجاح",
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

    const tempUrls = {
      profileImage: files?.profileImage?.[0] ? `${BASE_URL}/images/${files.profileImage[0].filename}` : "",
      nationalIdImage: files?.nationalIdImage?.[0] ? `${BASE_URL}/images/${files.nationalIdImage[0].filename}` : "",
      licenseImage: files?.licenseImage?.[0] ? `${BASE_URL}/images/${files.licenseImage[0].filename}` : "",
      carRegistrationImage: files?.carRegistrationImage?.[0] ? `${BASE_URL}/images/${files.carRegistrationImage[0].filename}` : "",
      carImage: files?.carImage?.[0] ? `${BASE_URL}/images/${files.carImage[0].filename}` : "",
    };

    const { error } = winshImagesSchema(lang).validate(tempUrls);
    if (error) {
      return res.status(400).send({
        code: 400,
        status: false,
        message: error.details[0].message,
      });
    }

    const savedUrls = {
      profileImage: files?.profileImage?.[0] ? BASE_URL + saveImage(files.profileImage[0]) : "",
      nationalIdImage: files?.nationalIdImage?.[0] ? BASE_URL + saveImage(files.nationalIdImage[0]) : "",
      licenseImage: files?.licenseImage?.[0] ? BASE_URL + saveImage(files.licenseImage[0]) : "",
      carRegistrationImage: files?.carRegistrationImage?.[0] ? BASE_URL + saveImage(files.carRegistrationImage[0]) : "",
      carImage: files?.carImage?.[0] ? BASE_URL + saveImage(files.carImage[0]) : "",
    };

    const winch = await winsh.findOneAndUpdate(
      { providerId },
      {
        providerId,
        ...savedUrls,
      },
      { upsert: true, new: true }
    );

    res.status(200).send({
      status: true,
      code: 200,
      message: lang === "en" ? "Images uploaded successfully" : "تم رفع الصور بنجاح",
    });
  } catch (error) {
    next(error);
  }
};
const uploadTireImages = async (req, res, next) => {
  try {
    const lang = req.headers["accept-language"] || "en";
    const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
    const files = req.files;
    const role = req.user.role;
    if (role !== "serviceProvider") {
      return res.status(400).send({
        status: false,
        code: 400,
        message: lang === "en" ? "Not allowed for you" : "غير مسموح لك"
      });
    }
    // ✅ تجهيز الرابط بدون حفظ فعلي
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

    // ✅ حفظ الرابط في قاعدة البيانات
    const Tire = await tire.findOneAndUpdate(
      { providerId: req.user.id },
      {
        profileImage: profileImageUrl,
        ...(req.body.notes && { notes: req.body.notes }),
      },
      { upsert: true, new: true }
    );

    res.status(200).send({
      status: true,
      code: 200,
      message: lang == "en" ? "Image uploaded and saved successfully" : "تم الرفع الصوره بنجاح",
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

    const verification = await tire.create({
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

    res.status(200).send({
      status: true,
      code: 200,
      message: lang === "en" ? "Verification request submitted successfully." : "تم إرسال طلبك بنجاح",
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


















