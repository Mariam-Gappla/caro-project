const carRental = require("../models/carRental");
const { carRentalWeeklyValiditionSchema, rentToOwnSchema, carRentalWeeklyValiditionUpdateSchema, rentToOwnUpdateSchema } = require("../validation/carRentalValidition");
const getMessages = require("../configration/getmessages");
const Name = require("../models/carName");
const Model = require("../models/carModel");
const rentalOfficeOrder=require("../models/rentalOfficeOrders")
const carRentalArchive=require("../models/carArchive");
const path = require("path");
const fs = require("fs");
const addCar = async (req, res, next) => {
  try {
    const files = req.files || [];
    const lang = req.headers['accept-language'] || 'en';
    const BASE_URL = process.env.BASE_URL || 'http://localhost:3000/';

    const imagePaths = [];
    const fileInfos = files.map(file => {
      const fileName = `${Date.now()}-${file.originalname}`;
      const filePath = path.join('/var/www/images', fileName);
      imagePaths.push(`${BASE_URL}images/${fileName}`);
      return { fileName, filePath, buffer: file.buffer };
    });
    // 🔹 أولًا: نتحقق من البيانات قبل حفظ الصور
    const { rentalType } = req.body;
    let error;
    if (rentalType === "weekly/daily") {
      error = carRentalWeeklyValiditionSchema(lang).validate({ ...req.body, images: imagePaths }).error;
    } else if (rentalType === "rent to own") {
      error = rentToOwnSchema(lang).validate({ ...req.body, images: imagePaths }).error;
    }

    if (error) {
      return res.status(400).send({
        code: 400,
        status: false,
        message: error.details[0].message
      });
    }
    fileInfos.forEach(file => {
      fs.writeFileSync(file.filePath, file.buffer);
      console.log('Saved file at:', file.filePath);
    });


    // 🔹 حفظ الداتا في قاعدة البيانات بعد حفظ الصور
    await carRental.create({
      rentalType: req.body.rentalType,
      images: imagePaths,
      nameId: req.body.nameId,
      modelId: req.body.modelId,
      carTypeId: req.body.carTypeId,
      licensePlateNumber: req.body.licensePlateNumber,
      city: req.body.city,
      area: req.body.area,
      carDescription: req.body.carDescription,
      deliveryOption: req.body.deliveryOption,
      odoMeter: req.body.odoMeter,
      rentalOfficeId: req.user.id
    });

    return res.status(200).send({
      code: 200,
      status: true,
      message: lang === "ar" ? "تم اضافه السياره بنجاح" : "car added successfully"
    });

  } catch (err) {
    next(err);
  }
};
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
    const car = await carRental.findOne({ _id: carId }).populate("nameId").populate("modelId").populate("carTypeId").lean();
    console.log(car)
    if (!car) {
      return res.status(400).send({
        code: 400,
        status: false,
        message: messages.rentalCar.existCar
      })
    }
    const name = await Name.findOne({ _id: car.nameId });
    const model = await Model.findOne({ _id: car.modelId });
    let formatedData;
    const { __v ,rentalOfficeId,nameId,modelId,carTypeId, ...data } = car;
    if (car.rentalType == "weekly/daily") {
      formatedData = {
        ...data,
        nameId:{
          id:nameId._id,
          carName:lang=="en"?nameId.carName.en:nameId.carName.ar
        },
        modelId:{
          id:modelId._id,
          model:lang=="en"?modelId.model.en:modelId.model.ar
        },
        carTypeId:{
          id:carTypeId._id,
          type:lang=="en"?carTypeId.type.en:carTypeId.type.ar
        },
        title: lang == "ar" ? `تأجير سياره ${name.carName.ar + " " + model.model.ar}` : `Renting a car ${name.carName.en + " " + model.model.en}`,
      }
    }
    else {
      formatedData = {
        ...data,
        nameId:{
          id:nameId._id,
          carName:lang=="en"?nameId.carName.en:nameId.carName.ar
        },
        modelId:{
          id:modelId._id,
          model:lang=="en"?modelId.model.en:modelId.model.ar
        },
        carTypeId:{
          id:carTypeId._id,
          type:lang=="en"?carTypeId.type.en:carTypeId.type.ar
        },
        title: lang === "ar"
          ? `تملك سيارة ${name?.carName.ar || ""} ${model?.model.ar || ""}`
          : `Owning a car ${name?.carName.en || ""} ${model?.model.en || ""}`,
      }

    }
    return res.status(200).send({
      status: true,
      code:200,
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
const deleteCar = async (req, res, next) => {
  try {
    const lang = req.headers['accept-language'] || 'en';
    const id = req.params.id;

    const car = await carRental.findOne({ _id: id });
    if (!car) {
      return res.status(404).send({
        status: false,
        code: 404,
        message: lang == "ar" ? "السيارة غير موجودة" : "Car not found"
      });
    }

    // تحويل الكائن وحذف _id
    const carData = car.toObject();
    delete carData._id;

    // حفظ في الأرشيف
    const archivedCar = await carRentalArchive.create({
      ...carData,
      originalCarId: car._id
    });

    // تحديث الطلبات
    await rentalOfficeOrder.updateMany(
      { carId: car._id },
      { $set: { archivedCarId: archivedCar._id } }
    );

    // حذف من الجدول الأصلي
    await carRental.findOneAndDelete({ _id: id });

    return res.status(200).send({
      code: 200,
      status: true,
      message: lang == "ar" ? "تم حذف الاعلان بنجاح" : "Car listing deleted successfully"
    });

  } catch (error) {
    next(error);
  }
};


module.exports = {
  addCar,
  getCarsByRentalOfficeForUser,
  getCarById,
  updateCar,
  deleteCar
}