const carRental = require("../models/carRental");
const { carRentalWeeklyValiditionSchema, rentToOwnSchema } = require("../validation/carRentalValidition");
const getMessages = require("../configration/getmessages");
const path = require("path");
const fs = require("fs");
const addCar = async (req, res, next) => {
    try {
        console.log(req.user.id)
        const imageBuffers = req.files || [];
        const lang = req.headers['accept-language'] || 'en';
        // ⏰ نحفظ اسم الصورة مرة واحدة لكل صورة
        const imagePaths = [];
        const messages = getMessages(lang);
        const fileInfos = imageBuffers.map(file => {
            const fileName = `${Date.now()}-${file.originalname}`;
            const filePath = path.join(__dirname, '../images', fileName);
            imagePaths.push(`http://localhost:3000/images/${fileName}`);
            return { fileName, filePath, buffer: file.buffer };
        });
        const { rentalType } = req.body;
        if (rentalType == "weekly/daily") {

            const { error } = carRentalWeeklyValiditionSchema(lang).validate({
                ...req.body,
                images: imagePaths,
            });
            if (error) {
                return res.status(400).send({
                    code: 400,
                    status: false,
                    message: error.details[0].message
                });
            }
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

        }
        else if (rentalType == "rent to own") {
            const { error } = rentToOwnSchema(lang).validate({
                ...req.body,
                images: imagePaths,
            });
            if (error) {
                return res.status(400).send({
                    code: 400,
                    status: false,
                    message: error.details[0].message
                });
            }
            await carRental.create({
                rentalType: req.body.rentalType,
                images: imagePaths,
                carName: req.body.carName,
                carType: req.body.carType,
                carModel: req.body.carModel,
                licensePlateNumber: req.body.licensePlateNumber,
                totalKilometers: req.body.totalKilometers,
                carPrice: req.body.carPrice,
                monthlyPayment: req.body.monthlyPayment,
                finalPayment: req.body.finalPayment,
                city: req.body.city,
                area: req.body.area,
                carDescription: req.body.carDescription,
                deliveryOption: req.body.deliveryOption,
                rentalOfficeId: req.user.id
            });
        }




        // 💾 احفظ الملفات باستخدام الأسماء اللي جهزناها
        fileInfos.forEach(file => {
            fs.writeFileSync(file.filePath, file.buffer);
        });




        return res.status(200).send({
            code: 200,
            status: true,
            message: "تم اضافه السياره بنجاح"
        });
    } catch (err) {
        next(err);
    }
}

const getCarsByRentalOffice = async (req, res, next) => {
    try {
        const id = req.user.id;
        const lang = req.headers['accept-language'] || 'en';
        const messages = getMessages(lang)
        console.log(id)
        const cars = await carRental.find({ rentalOfficeId: id });

        if (!cars) {
            return res.status(400).send({
                code: 400,
                status: false,
                message: messages.rentalOffice.haveCars
            });
        }
        return res.status(200).send({
            code: 200,
            status: true,
            data: cars
        })
    }
    catch (err) {
        next(err)
    }
}
const getCarById = async (req, res, next) => {
    try {
        const rentalOfficeId = req.user.id;
        const carId = req.params.id;
        const lang = req.headers['accept-language'] || 'en';
        const messages = getMessages(lang)
        const car = await carRental.find({ _id: carId, rentalOfficeId: rentalOfficeId });
        if (!car) {
            return res.status(400).send({
                code: 400,
                status: false,
                message: messages.rentalCar.existCar
            })
        }
        return res.status(200).send({
            status: 200,
            data: car
        })
    }
    catch (err) {
        next(err)
    }
}
module.exports = {
    addCar,
    getCarsByRentalOffice,
    getCarById
}