const carRental = require("../models/carRental");
const { carRentalWeeklyValiditionSchema, rentToOwnSchema,carRentalWeeklyValiditionUpdateSchema,rentToOwnUpdateSchema } = require("../validation/carRentalValidition");
const getMessages = require("../configration/getmessages");
const Name=require("../models/carName");
const Model=require("../models/carType");
const path = require("path");
const fs = require("fs");
const addCar = async (req, res, next) => {
    try {
        console.log(req.user.id)
        const imageBuffers = req.files || [];
        const lang = req.headers['accept-language'] || 'en';
        const BASE_URL = process.env.BASE_URL || 'http://localhost:3000/';
        // ⏰ نحفظ اسم الصورة مرة واحدة لكل صورة
        const imagePaths = [];
        const messages = getMessages(lang);
        const fileInfos = imageBuffers.map(file => {
            const fileName = `${Date.now()}-${file.originalname}`;
            const filePath = path.join(__dirname, '../images', fileName);
            imagePaths.push(`${BASE_URL}images/${fileName}`);
            return { fileName, filePath, buffer: file.buffer };
        });
        console.log(imagePaths);
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
                nameId:req.body.nameId,
                modelId:req.body.modelId,
                carType: req.body.carType,
                licensePlateNumber: req.body.licensePlateNumber,
                freeKilometers: req.body.freeKilometers,
                pricePerFreeKilometer: req.body.pricePerFreeKilometer,
                pricePerExtraKilometer: req.body.pricePerExtraKilometer,
                city: req.body.city,
                area: req.body.area,
                carDescription: req.body.carDescription,
                deliveryOption: req.body.deliveryOption,
                odoMeter: req.body.odoMeter,
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
                nameId:req.body.nameId,
                modelId:req.body.modelId,
                carType: req.body.carType,
                licensePlateNumber: req.body.licensePlateNumber,
                carPrice: req.body.carPrice,
                monthlyPayment: req.body.monthlyPayment,
                odoMeter: req.body.odoMeter,
                finalPayment: req.body.finalPayment,
                city: req.body.city,
                area: req.body.area,
                carDescription: req.body.carDescription,
                deliveryOption: req.body.deliveryOption,
                ownershipPeriod: req.body.ownershipPeriod,
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
            message: lang == "ar" ? "تم اضافه السياره بنجاح" : "car added successfully"
        });
    } catch (err) {
        next(err);
    }
}
const getCarsByRentalOfficeForUser = async (req, res, next) => {
    try {
        const id = req.params.id;
        console.log(id)
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
            message: lang == "en" ? "Your request has been completed successfully" : "تمت معالجة الطلب بنجاح",
            data: cars
        })
    }
    catch (err) {
        next(err)
    }
}
const getCarById = async (req, res, next) => {
    try {
      console.log("order")
        const user = req.user.id;
        const carId = req.params.id;
        const lang = req.headers['accept-language'] || 'en';
        const messages = getMessages(lang);
        const car = await carRental.find({ _id: carId });
        console.log(car)
        if (!car) {
            return res.status(400).send({
                code: 400,
                status: false,
                message: messages.rentalCar.existCar
            })
        }
        const name=Name.findOne({_id:car[0].nameId});
        console.log(name)
        const model=Model.findOne({_id:car[0].modelId});
        const formatedData={
          ...car,
          title:lang=="ar"?`تأجير سياره ${name.carName+" "+model.modelName}`:`Renting a car ${name.carName+" "+model.modelName}`,
        }
        return res.status(200).send({
            status: 200,
            message: lang == "en" ? "Your request has been completed successfully" : "تمت معالجة الطلب بنجاح",
            data: formatedData
        })
    }
    catch (err) {
        next(err)
    }
}
const updateCar = async (req, res, next) => {
  try {
    const id = req.params.id;
    const lang = req.headers['accept-language'] || 'en';
    const BASE_URL = process.env.BASE_URL || 'http://localhost:3000/';
    const messages = getMessages(lang);

    const imageBuffers = req.files || [];

    // 1. جيب العربية المرتبطة بالمستخدم الحالي
    const car = await carRental.findOne({ _id: id, rentalOfficeId: req.user.id });
    if (!car) {
      return res.status(404).send({
        status: false,
        message: lang === "en" ? "Car not found" : "السيارة غير موجودة"
      });
    }

    // 2. جهزي الصور اللي عايز يحذفها
    const imagesToDelete = req.body.imagesToDelete
      ? Array.isArray(req.body.imagesToDelete)
        ? req.body.imagesToDelete
        : [req.body.imagesToDelete]
      : [];

    // 3. حذف الصور من السيرفر
    imagesToDelete.forEach(imgUrl => {
      const fileName = imgUrl.split('/').pop();
      const filePath = path.join(__dirname, '../images', fileName);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    });

    // 4. الصور القديمة اللي هتفضل بعد الحذف
    let updatedImages = car.images.filter(img => !imagesToDelete.includes(img));

    // 5. جهزي الصور الجديدة
    const fileInfos = imageBuffers.map(file => {
      const fileName = `${Date.now()}-${file.originalname}`;
      const filePath = path.join(__dirname, '../images', fileName);
      updatedImages.push(BASE_URL + fileName);
      return { fileName, filePath, buffer: file.buffer };
    });

    // 6. اختاري الـ schema المناسب حسب rentalType
    const rentalType = req.body.rentalType || car.rentalType;

    const schema = rentalType === "weekly/daily"
      ? carRentalWeeklyValiditionUpdateSchema(lang)
      : rentToOwnUpdateSchema(lang);

    const { error } = schema.validate({ ...req.body, images: updatedImages });
    if (error) {
      return res.status(400).send({
        code: 400,
        status: false,
        message: error.details[0].message
      });
    }

    // 7. تحديث بيانات السيارة
    await carRental.updateOne(
      { _id: id },
      {
        $set: {
          ...req.body,
          images: updatedImages
        }
      }
    );

    // 8. حفظ الصور الجديدة على السيرفر
    fileInfos.forEach(file => {
      fs.writeFileSync(file.filePath, file.buffer);
    });

    return res.status(200).send({
      status: true,
      code: 200,
      message: lang === "en" ? "Car updated successfully" : "تم تحديث السيارة بنجاح"
    });

  } catch (err) {
    next(err);
  }
};

module.exports = {
    addCar,
    getCarsByRentalOfficeForUser,
    getCarById,
    updateCar
}