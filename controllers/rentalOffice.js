const rentalOffice = require("../models/rentalOffice");
const getMessages = require("../configration/getmessages")
const followersForRentalOffice = require("../models/followersForRentalOffice");
const ratingForOrder = require("../models/ratingForOrder");
const carRental = require("../models/carRental");
const path=require("path");
const fs=require("fs")
const Name = require("../models/carName");
const Model = require("../models/carModel");
const bcrypt = require("bcrypt");
const saveImage = (file, folder = 'images') => {
  const fileName = `${Date.now()}-${file.originalname}`;
  const saveDir = path.join(__dirname, '..', folder);
  const filePath = path.join(saveDir, fileName);

  if (!fs.existsSync(saveDir)) {
    fs.mkdirSync(saveDir, { recursive: true });
  }

  fs.writeFileSync(filePath, file.buffer);
  return `images/${fileName}`;
};
const getAllRentallOffice = async (req, res, next) => {
    try {
        const lang = req.headers['accept-language'] || 'en';
        const allRentalOffice = await rentalOffice.find();
        return res.status(200).send({
            code: 200,
            status: true,
            message: lang == "en" ? "Your request has been completed successfully" : "تمت معالجة الطلب بنجاح",
            data: allRentalOffice
        });

    }
    catch (err) {
        next(err)
    }
}
const addLike = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const rentalOfficeId = req.params.id;
        const lang = req.headers['accept-language'] || 'en';
        const messages = getMessages(lang);
        const existRentalOffice = await rentalOffice.findOne({ _id: rentalOfficeId });
        if (!existRentalOffice) {
            return res.status(400).send({
                status: 400,
                code: false,
                message: messages.rentalOffice.existRentalOffice
            });
        }
        const alreadyLiked = existRentalOffice.likedBy.includes(userId);
        let updatedRentalOffice;
        if (alreadyLiked) {
            // Remove the like
            updatedRentalOffice = await rentalOffice.findByIdAndUpdate(
                rentalOfficeId,
                { $pull: { likedBy: userId } },
                { new: true }
            );
        } else {
            // Add the like
            updatedRentalOffice = await rentalOffice.findByIdAndUpdate(
                rentalOfficeId,
                { $addToSet: { likedBy: userId } }, // $addToSet prevents duplicates
                { new: true }
            );
        }
        return res.status(200).send({
            status: true,
            code: 200,
            message: alreadyLiked ? messages.rentalOffice.removeLike : messages.rentalOffice.addLike,
        });
    }
    catch (err) {
        next(err);
    }
}
const getRentalOfficeCar = async (req, res, next) => {
    const lang = req.headers['accept-language'] || 'en';
    const messages = getMessages(lang);

    try {
        const rentalOfficeId = req.user.id;
        const rentalType = req.query.rentalType;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // تأكد من وجود المكتب
        const existRentalOffice = await rentalOffice.findOne({ _id: rentalOfficeId });
        if (!existRentalOffice) {
            return res.status(400).send({
                status: false,
                code: 400,
                message: messages.rentalOffice.existRentalOffice
            });
        }

        // عدّ العربيات أولًا
        const carFilter = { rentalOfficeId };
        if (rentalType) {
            carFilter.rentalType = rentalType;
        }

        const totalCars = await carRental.countDocuments(carFilter);
        const cars = await carRental.find(carFilter).skip(skip).limit(limit);
        const formatedCars = await Promise.all(
            cars.map(async (car) => {
                console.log(car)
                const name = await Name.findOne({ _id: car.nameId });
                const model = await Model.findOne({ _id: car.modelId });

                let title;
                if (rentalType === "weekly/daily") {
                    title =
                        lang === "ar"
                            ? `تأجير سيارة ${name.carName.ar || ""} ${model?.model.ar || ""}`
                            : `Renting a car ${name.carName.en || ""} ${model?.model.en || ""}`;
                    return {
                        id: car._id,
                        title,
                        rentalType: "weekly/daily",
                        images: car.images,
                        carDescription: car.carDescription,
                        city: car.city,
                        odoMeter: car.odoMeter,
                        price: car.pricePerFreeKilometer ?? car.pricePerExtraKilometer,
                    };
                } else {
                    title =
                    lang === "ar"
                            ? `تملك سيارة ${name?.carName.ar || ""} ${model.model.ar || ""}`
                            : `Owning a car ${name?.carName.en || ""} ${model.model.en || ""}`;
                    return {
                        id: car._id,
                        title,
                        rentalType: "rent to own",
                        images: car.images,
                        model: lang === "ar" ?model?.model.ar:model?.model.en,
                        carDescription: car.carDescription,
                        city: car.city,
                        odoMeter: car.odoMeter,
                        price: car.carPrice,
                        monthlyPayment: car.monthlyPayment,
                        finalPayment: car.finalPayment
                    };
                }


            })
        );


        // Response
        return res.status(200).send({
            status: true,
            code: 200,
            message: lang === "en"
                ? "Your request has been completed successfully"
                : "تمت معالجة الطلب بنجاح",
            data: {
                cars: formatedCars,
                pagination: {
                    currentPage: page,
                    totalPages: Math.ceil(totalCars / limit)
                }
            }
        });

    } catch (err) {
        next(err);
    }
};
const getProfileData = async (req, res, next) => {
    try {
        const lang = req.headers['accept-language'] || 'en';
        const rentalOfficeId = req.user.id;
        const existRentalOffice = await rentalOffice.findOne({ _id: rentalOfficeId });
        if (!existRentalOffice) {
            return res.status(400).send({
                status: false,
                code: 400,
                message: messages.rentalOffice.existRentalOffice
            });
        }

        // لايكات
        const likes = existRentalOffice.likedBy.length;

        // المتابعين
        const followersCount = await followersForRentalOffice.countDocuments({ rentalOfficeId });

        // التقييم
        const result = await ratingForOrder.aggregate([
            {
                $match: {
                    targetId: existRentalOffice._id,
                    targetType: 'rentalOffice'
                }
            },
            {
                $group: {
                    _id: null,
                    averageRating: { $avg: "$rating" }
                }
            }
        ]);
        const averageRating = result.length > 0 ? result[0].averageRating.toFixed(1) : 0;
        return res.status(200).send({
            status: true,
            code: 200,
            message: lang === "en"
                ? "Your request has been completed successfully"
                : "تمت معالجة الطلب بنجاح",
            data: {
                username: existRentalOffice.username,
                image: existRentalOffice.image,
                rating: averageRating,
                likes: likes,
                followers: followersCount,
            }
        });

    }
    catch (error) {
        next(error)
    }
}


module.exports = {
    getAllRentallOffice,
    addLike,
    getRentalOfficeCar,
    getProfileData
}