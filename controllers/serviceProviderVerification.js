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
const addVerficationForwinsh = async (req, res, next) => {
    try {
        const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
        const providerId = req.user.id;
        const role=req.user.role;
        const lang = req.headers['accept-language'] || 'en';
         if(role!="serviceProvider")
        {
            return res.status(400).send({
                status:false,
                code:400,
                message:lang=="en"?"not allow for you":"غير مسموح لك"
            })
        }
        const files = req.files;

        const profileImagePath = files?.profileImage?.[0] ? `/images/${Date.now()}-${files.profileImage[0].originalname}` : "";
        const nationalIdImagePath = files?.nationalIdImage?.[0] ? `/images/${Date.now()}-${files.nationalIdImage[0].originalname}` : "";
        const licenseImagePath = files?.licenseImage?.[0] ? `/images/${Date.now()}-${files.licenseImage[0].originalname}` : "";
        const carRegistrationImagePath = files?.carRegistrationImage?.[0] ? `/images/${Date.now()}-${files.carRegistrationImage[0].originalname}` : "";
        const carImagePath = files?.carImage?.[0] ? `/images/${Date.now()}-${files.carImage[0].originalname}` : "";

        const { error } = winchSchema(lang).validate({
            providerId,
            profileImage: profileImagePath,
            nationalIdImage: nationalIdImagePath,
            licenseImage: licenseImagePath,
            carRegistrationImage: carRegistrationImagePath,
            carImage: carImagePath,
            ...req.body
        });

        if (error) {
            return res.status(400).send({
                code: 400,
                status: false,
                message: error.details[0].message
            });
        }
        const saveProfileImage = files?.profileImage?.[0] ? saveImage(files.profileImage[0]) : "";
        const saveNationalIdImage = files?.nationalIdImage?.[0] ? saveImage(files.nationalIdImage[0]) : "";
        const saveLicenseImage = files?.licenseImage?.[0] ? saveImage(files.licenseImage[0]) : "";
        const saveCarRegistrationImage = files?.carRegistrationImage?.[0] ? saveImage(files.carRegistrationImage[0]) : "";
        const saveCarImage = files?.carImage?.[0] ? saveImage(files.carImage[0]) : "";

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
            profileImage: BASE_URL + saveProfileImage,
            nationalIdImage: BASE_URL + saveNationalIdImage,
            licenseImage: BASE_URL + saveLicenseImage,
            carRegistrationImage: BASE_URL + saveCarRegistrationImage,
            carImage: BASE_URL + saveCarImage
        });

        res.status(200).send({
            status: true,
            message: lang == "en" ? "Verification request submitted successfully." : "تم ارسال طلبك بنجاح",
            data: verification
        });

    } catch (error) {
        next(error);
    }
};

const addverficationForTire = async(req, res, next) => {
    try {
        const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
        const providerId = req.user.id;
        const lang = req.headers['accept-language'] || 'en';
        const files = req.files;
        const role=req.user.role;
        if(role!="serviceProvider")
        {
            return res.status(400).send({
                status:false,
                code:400,
                message:lang=="en"?"not allow for you":"غير مسموح لك"
            })
        }
        console.log(providerId)
        const profileImagePath = files?.profileImage?.[0] ? `/images/${Date.now()}-${files.profileImage[0].originalname}` : "";
        const { error } = tireSchema(lang).validate({
            providerId,
            profileImage: profileImagePath,
            ...req.body
        });
        if (error) {
            return res.status(400).send({
                code: 400,
                status: false,
                message: error.details[0].message
            });
        }
        const saveProfileImage = files?.profileImage?.[0] ? saveImage(files.profileImage[0]) : "";
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
            profileImage: BASE_URL + saveProfileImage,
        });

        res.status(200).send({
            status: true,
            message: lang == "en" ? "Verification request submitted successfully." : "تم ارسال طلبك بنجاح",
            data: verification
        });

    }
    catch (error) {
        next(error)
    }
}
module.exports = {
    addVerficationForwinsh,
    addverficationForTire
}

















