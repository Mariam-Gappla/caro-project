const verificationAccount = require("../models/accountVerification");
const winchSchema = require("../validation/winshValidition");
const tireSchema=require("../validation/tireRefilling");
const tire=require("../models/tire");
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
/*
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

    const { error } = winchSchema(lang).validate({
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

    const verification = await verificationAccount.create({
      providerId,
      serviceType: req.body.serviceType,
      fullName: req.body.fullName,
      nationality: req.body.nationality,
      nationalId: req.body.nationalId,
      birthDate: req.body.birthDate,
      email: req.body.email,
      iban: req.body.iban,
      bankAccountName: req.body.bankAccountName,
      winchType: req.body.winchType,
      carPlateNumber: req.body.carPlateNumber,
      profileImage: req.body.profileImage,
      nationalIdImage: req.body.nationalIdImage,
      licenseImage: req.body.licenseImage,
      carRegistrationImage: req.body.carRegistrationImage,
      carImage: req.body.carImage
    });

    res.status(200).send({
      status: true,
      code:200,
      message: lang === "en" ? "Verification request submitted successfully." : "تم ارسال طلبك بنجاح",
    });
  } catch (error) {
    next(error);
  }
};
const uploadWinchImages = async (req, res, next) => {
  try {
    const lang = req.headers["accept-language"] || "en";
    const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
    const files = req.files;

    const profileImage = files?.profileImage?.[0] ? saveImage(files.profileImage[0]) : "";
    const nationalIdImage = files?.nationalIdImage?.[0] ? saveImage(files.nationalIdImage[0]) : "";
    const licenseImage = files?.licenseImage?.[0] ? saveImage(files.licenseImage[0]) : "";
    const carRegistrationImage = files?.carRegistrationImage?.[0] ? saveImage(files.carRegistrationImage[0]) : "";
    const carImage = files?.carImage?.[0] ? saveImage(files.carImage[0]) : "";

    res.status(200).send({
      status: true,
      code:200,
      message:lang=="en"?"Images uploaded successfully":"تم رفع الصور بنجاح",
    });
  } catch (error) {
    next(error);
  }
};
const uploadTireImages = async (req, res, next) => {
  try {
    const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
    const files = req.files;

    const profileImage = files?.profileImage?.[0] ? saveImage(files.profileImage[0]) : "";

    res.status(200).send({
      status: true,
      message: "Image uploaded successfully",
      data: {
        profileImage: BASE_URL + profileImage,
      }
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
      profileImage: req.body.profileImage, // رابط الصورة الجاهزة من الخطوة السابقة
    });

    res.status(200).send({
      status: true,
      message: lang === "en" ? "Verification request submitted successfully." : "تم إرسال طلبك بنجاح",
      data: verification
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
    */

















