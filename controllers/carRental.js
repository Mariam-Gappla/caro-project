const carRental = require("../models/carRental");
const { carRentalValidationSchema } = require("../validation/carRentalValidition");
const path = require("path");
const fs = require("fs");
const addCar = async (req, res, next) => {
    try {
        console.log(req.user.id)
        const imageBuffers = req.files || [];
        
        // ⏰ نحفظ اسم الصورة مرة واحدة لكل صورة
        const imagePaths = [];
        
        const fileInfos = imageBuffers.map(file => {
            const fileName = `${Date.now()}-${file.originalname}`;
            const filePath = path.join(__dirname, '../images', fileName);
            imagePaths.push(`http://localhost:3000/images/${fileName}`);
            return { fileName, filePath, buffer: file.buffer };
        });

        // ✅ التحقق من البيانات
        const { error } = carRentalValidationSchema.validate({
            ...req.body,
            images: imagePaths,
        });

        if (error) {
            return res.status(400).send({
                status: 400,
                message: error.details[0].message
            });
        }

        // 💾 احفظ الملفات باستخدام الأسماء اللي جهزناها
        fileInfos.forEach(file => {
            fs.writeFileSync(file.filePath, file.buffer);
        });

        // ✅ خزّن البيانات في القاعدة
        await carRental.create({
            rentalType: req.body.rentalType,
            images: imagePaths,
            carName: req.body.carName,
            carType: req.body.carType,
            carModel: req.body.carModel,
            licensePlateNumber: req.body.licensePlateNumber,
            freeKilometers: req.body.freeKilometers,
            pricePerFreeKilometer: req.body.pricePerFreeKilometer,
            pricePerExtraKilometer: req.body.pricePerExtraKilometer,
            city: req.body.city,
            area: req.body.area,
            carDescription: req.body.carDescription,
            deliveryOption: req.body.deliveryOption,
            rentalOfficeId: req.user.id
        });

        return res.status(200).send({
            status: 200,
            message: "تم اضافه السياره بنجاح"
        });
    } catch (err) {
        next(err);
    }
}

const getCarsByRentalOffice = async (req, res, next) => {
    try {
       const id= req.user.id;
       console.log(id)
       const cars= await carRental.find({rentalOfficeId:id});
       if(!cars)
       {
        return res.status(200).send({
            status:200,
            message:"هذا المكتب ليس لديه اى سيارات"
        });
       }
       return res.status(200).send({
        status:200,
        data:cars
       })
    }
    catch (err) {
        next(err)
    }
}
module.exports = {
    addCar,
    getCarsByRentalOffice
}