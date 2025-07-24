const { serviceWinchValidationSchema, serviceTireValidationSchema } = require("../validation/serviceProviderOrdersValidition");
const serviceProviderOrder = require("../models/serviceProviderOrders");
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
const addWinchOrder = async (req, res, next) => {
    try {
        const lang = req.headers['accept-language'] || 'en';
        const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
        const file = req.file;
        const image = file ? `${BASE_URL}/images/${file.filename}` : "";
        req.body.location = {
            lat: Number(req.body['location.lat']),
            long: Number(req.body['location.long'])
        };
        req.body.carLocation = {
            lat: Number(req.body['carLocation.lat']),
            long: Number(req.body['carLocation.long'])
        };
        req.body.dropoffLocation = {
            lat: Number(req.body['dropoffLocation.lat']),
            long: Number(req.body['dropoffLocation.long'])
        };


        delete req.body['location.lat'];
        delete req.body['location.long'];
        delete req.body['carLocation.lat'];
        delete req.body['carLocation.long'];
        delete req.body['dropoffLocation.lat'];
        delete req.body['dropoffLocation.long'];
        const formatedData = {
            ...req.body,
            image: image,
        };

        console.log("formatedData", formatedData);

        const { error } = serviceWinchValidationSchema(lang).validate(formatedData);
        if (error) {
            return res.status(400).json({
                status: false,
                code: 400,
                message: error.details[0].message,
            });
        }
        const savedImagePath = saveImage(file); // مثل: "abc.jpg"
        formatedData.image = `${BASE_URL}/images/${savedImagePath}`;
        await serviceProviderOrder.create(formatedData);
        return res.status(200).json({
            status: true,
            code: 201,
            message: lang === 'ar' ? "تم إنشاء الطلب بنجاح" : "Order created successfully",
        });
    } catch (err) {
        next(err);
    }
};
const addTireOrder = async (req, res, next) => {
    try {
        const lang = req.headers['accept-language'] || 'en';
        const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
        const file = req.file;
        const image = file ? `${BASE_URL}/images/${file.filename}` : "";
        req.body.location = {
            lat: Number(req.body['location.lat']),
            long: Number(req.body['location.long'])
        };
        delete req.body['location.lat'];
        delete req.body['location.long'];
        const formatedData = {
            ...req.body,
            image: image,
        };

        const { error } = serviceTireValidationSchema(lang).validate(formatedData);
        if (error) {
            return res.status(400).json({
                status: false,
                code: 400,
                message: error.details[0].message,
            });
        }
        const savedImagePath = saveImage(file); // مثل: "abc.jpg"
        formatedData.image = `${BASE_URL}/images/${savedImagePath}`;
        await serviceProviderOrder.create(formatedData);
        return res.status(200).json({
            status: true,
            code: 201,
            message: lang === 'ar' ? "تم إنشاء الطلب بنجاح" : "Order created successfully",
        });
    } catch (err) {
        next(err);
    }
}
module.exports = {
    addWinchOrder,
    addTireOrder
}