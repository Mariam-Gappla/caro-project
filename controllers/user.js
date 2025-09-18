const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Otp = require("../models/otp");
const { registerSchema, loginSchema, registerProviderSchema } = require("../validation/registerAndLoginSchema");
const changePasswordSchema = require("../validation/changePasswordValidition");
const workSession = require("../models/workingSession");
const rentalOffice = require("../models/rentalOffice");
const getMessages = require("../configration/getmessages");
const serviceProvider = require("../models/serviceProvider");
const RatingCenter = require("../models/ratingCenter");
const CenterService = require("../models/centerServices")
const userAsProviderSchema = require("../validation/userAsProviderValidition");
const Winsh = require("../models/winsh");
const centerFollower = require("../models/followerCenter");
const Tire = require("../models/tire");
const path = require("path");
const fs = require("fs");
const saveImage = require("../configration/saveImage");
const mongoose = require("mongoose");
const register = async (req, res, next) => {
  try {
    const lang = req.headers['accept-language'] || 'en';
    const messages = getMessages(lang);

    const token = req.headers.authorization?.split(" ")[1];
    decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { identifier } = decoded;
    const { password, phone, role } = req.body;
    console.log(req.body)
    const hashedPassword = await bcrypt.hash(password, 10);
    if (role == "user") {
      const { error } = registerSchema(lang).validate(req.body);
      if (error) {
        return res.status(400).send({
          status: false,
          code: 400,
          message: error.details[0].message
        })
      }
      const { username, email, password, phone, role } = req.body;
      const existUser = await User.findOne({ phone });
      if (existUser) {
        return res.status(400).send({
          status: false,
          code: 400,
          message: messages.register.emailExists.user
        })
      }
      await User.create({
        username,
        email,
        password: hashedPassword,
        phone
      });
      return res.status(200).send({
        status: true,
        code: 200,
        message: messages.register.createdSuccessfully
      });
    }
    else {
      return res.status(400).send({
        status: false,
        code: 400,
        message: lang == "en" ? "this role not exist" : "هذا الدور غير موجود"
      });
    }
  }
  catch (err) {
    next(err);
  }
}
const addLocationForProvider = async (req, res, next) => {
  try {

    const lang = req.headers['accept-language'] || 'en';
    const providerId = req.user.id;
    const role = req.user.role;
    if (role == 'serviceProvider') {
      const { location } = req.body;
      console.log(typeof location.long);
      if (!location || typeof location !== 'object' || location.lat === undefined || location.long === undefined) {
        return res.status(400).json({
          status: false,
          code: 400,
          message: lang === 'ar'
            ? 'يجب إرسال إحداثيات الموقع (lat, long)'
            : 'Location with lat and long is required',
        });
      }



      console.log(req.body.location);
      await serviceProvider.findOneAndUpdate({ _id: providerId }, { location: req.body.location }, { new: true });
      return res.status(200).send({
        status: true,
        code: 200,
        message: lang === "en" ? "Location updated successfully" : "تم تحديث الموقع بنجاح"
      });


    }



  }
  catch (error) {
    next(error)
  }
}
const login = async (req, res, next) => {
  try {
    const lang = req.headers['accept-language'] || 'en';
    const messages = getMessages(lang);

    const { error } = loginSchema(lang).validate(req.body);
    if (error) {
      return res.status(400).send({
        code: 400,
        status: false,
        message: error.details[0].message
      });
    }

    const { phone, password, role } = req.body;

    // ----------------------
    // الحالة: Rental Office
    // ----------------------
    if (role === "rentalOffice") {
      let existRentalOffice = await rentalOffice.findOne({ phone });

      if (!existRentalOffice) {
        // المستخدم ماعندوش حساب rentalOffice لكن ممكن يكون عنده حساب user
        const existUser = await User.findOne({ phone });
        if (!existUser) {
          return res.status(400).send({
            code: 400,
            status: false,
            message: messages.login.emailExists.rentalOffice || "رقم الهاتف غير مسجل"
          });
        }

        // تحقق من الباسورد
        const match = await bcrypt.compare(password, existUser.password);
        if (!match) {
          return res.status(400).send({
            code: 400,
            status: false,
            message: messages.login.incorrectData
          });
        }

        // إنشاء حساب rentalOffice من user
        existRentalOffice = await rentalOffice.create({
          username: existUser.username,
          phone: existUser.phone,
          password: existUser.password // مفيش داعي لعمل hash لأنه متخزن فعلاً كـ hash
        });
      } else {
        // تحقق من الباسورد مباشرة
        const match = await bcrypt.compare(password, existRentalOffice.password);
        if (!match) {
          return res.status(400).send({
            code: 400,
            status: false,
            message: messages.login.incorrectData
          });
        }
      }

      const token = jwt.sign({ id: existRentalOffice._id, role: "rentalOffice" }, process.env.JWT_SECRET);
      return res.status(200).send({
        code: 200,
        status: true,
        message: messages.login.success,
        data: {
          user: {
            _id: existRentalOffice._id,
            username: existRentalOffice.username,
            image: existRentalOffice.image,
            phone: existRentalOffice.phone,
            email: existRentalOffice.email,
            password: existRentalOffice.password,
            likedBy: existRentalOffice.likedBy,
            createdAt: existRentalOffice.createdAt,
            __v: 0,

          },
          token
        }
      });
    }

    // ----------------------
    // الحالة: Service Provider
    // ----------------------
    if (role === "serviceProvider") {
      const existServiceProvider = await serviceProvider.findOne({ phone });

      if (existServiceProvider) {
        // التحقق من حالة الطلب
        if (existServiceProvider.status === "refused") {
          return res.status(200).send({
            status: true,
            code: 200,
            message: lang === "en" ? "Your request has been refused" : "تم رفض الطلب"
          });
        }

        if (existServiceProvider.status === "pending") {
          return res.status(400).send({
            status: false,
            code: 400,
            message: lang === "en" ? "Your request is under review" : "جارى مراجعه الطلب"
          });
        }

        // الحالة مقبولة، التحقق من كلمة المرور وتسجيل الدخول
        if (existServiceProvider.status === "accepted") {
          const match = await bcrypt.compare(password, existServiceProvider.password);
          if (!match) {
            return res.status(400).send({
              code: 400,
              status: false,
              message: messages.login.incorrectData
            });
          }

          const lastSession = await workSession.findOne({ providerId: existServiceProvider._id })
            .sort({ createdAt: -1 });

          const { resetOtp, resetOtpExpires, ...user } = existServiceProvider.toObject();
          const token = jwt.sign(
            { id: existServiceProvider._id, role: "serviceProvider" },
            process.env.JWT_SECRET
          );

          return res.status(200).send({
            code: 200,
            status: true,
            message: messages.login.success,
            data: {
              user: {
                _id: existServiceProvider._id,
                username: existServiceProvider.username,
                image: existServiceProvider.image,
                phone: existServiceProvider.phone,
                email: existServiceProvider.email,
                password: existServiceProvider.password,
                likedBy: existServiceProvider.likedBy,
                createdAt: existServiceProvider.createdAt,
                __v: 0,
                active: lastSession ? lastSession.isWorking : false,
                location: user.location || null
              },
              token
            }
          });
        }

        // في حالة كانت الحالة غير معروفة
        return res.status(400).send({
          status: false,
          code: 400,
          message: lang === "en" ? "Unknown request status" : "حالة الطلب غير معروفة"
        });

      } else {
        // المستخدم غير موجود، إنشاء حساب جديد
        const hashedPassword = await bcrypt.hash(password, 10);

        await serviceProvider.create({
          password: hashedPassword,
          phone
        });

        const otp = 1111;
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

        await Otp.create({
          phone,
          otp,
          expiresAt
        });

        return res.status(200).send({
          status: true,
          code: 200,
          message: messages.sendCode.success
        });
      }
    }







    // ----------------------
    // الحالة: User
    // ----------------------
    if (role === "user") {
      const existUser = await User.findOne({ phone });
      if (!existUser) {
        return res.status(400).send({
          status: false,
          code: 400,
          message: messages.login.emailExists.user
        });
      }
      const userAsRentalOffice = await rentalOffice.findOne({ phone })

      const match = await bcrypt.compare(password, existUser.password);
      if (!match) {
        return res.status(400).send({
          code: 400,
          status: false,
          message: messages.login.incorrectData
        });
      }

      const token = jwt.sign({ id: existUser._id, role: "user" }, process.env.JWT_SECRET);
      const haveService = await CenterService.findOne({ centerId: existUser._id });
      return res.status(200).send({
        code: 200,
        status: true,
        message: messages.login.success,
        data: {
          user: {
            _id: existUser._id,
            username: existUser.username,
            image: existUser.image,
            phone: existUser.phone,
            email: existUser.email,
            password: existUser.password,
            likedBy: existUser.likedBy,
            createdAt: existUser.createdAt,
            subscribeAsRntalOffice: userAsRentalOffice ? true : false,
            haveService: haveService ? true : false,
            role: existUser.isProvider ? "provider" : "user",
            createdAt: existUser.createdAt,
            updatedAt: existUser.updatedAt,
            __v: 0,

          },
          token
        }
      });
    }

    // ----------------------
    // الحالة: دور غير معروف
    // ----------------------
    return res.status(400).send({
      code: 400,
      status: false,
      message: lang === "en" ? "Invalid role" : "الدور غير صالح"
    });

  } catch (err) {
    next(err);
  }
};
const requestResetPassword = async (req, res, next) => {
  try {
    const lang = req.headers['accept-language'] || 'en';
    const { phone, role } = req.body;
    let Model;

    switch (role) {
      case 'user':
        Model = User;
        break;
      case 'serviceProvider':
        Model = serviceProvider;
        break;
      case 'rentalOffice':
        Model = rentalOffice;
        break;
      default:
        return res.status(400).send({
          status: false,
          code: 400,
          message: lang == "ar" ? "هذا الدور غير موجود" : "role must be serviceProvider or User or rentalOffice"
        });
    }

    const user = await Model.findOne({ phone });
    if (!user) {
      return res.status(400).send({
        code: 400,
        status: false,
        message: lang == "ar" ? "هذا الرقم غير موجود" : "this phone does not exist"
      });
    }

    const otp = 1111 /*Math.floor(100000 + Math.random() * 900000)*/;
    user.resetOtp = otp;
    user.resetOtpExpires = new Date(Date.now() + 5 * 60 * 1000);
    await user.save();

    res.send({
      code: 200,
      status: true,
      message: lang == "ar" ? "تم ارسال الكود بنجاح" : "Code sent successfully"
    });
  } catch (err) {
    next(err);
  }
};
const resetPassword = async (req, res, next) => {
  try {
    const lang = req.headers['accept-language'] || 'en';
    const { phone, otp, newPassword, role } = req.body;

    // تحديد الموديل بناءً على الـ role
    let Model;
    switch (role) {
      case 'user':
        Model = User;
        break;
      case 'serviceProvider':
        Model = serviceProvider;
        break;
      case 'rentalOffice':
        Model = rentalOffice;
        break;
      default:
        return res.status(400).send({
          code: 400,
          status: false,
          message: lang == "en" ? "Invalid role" : "هذا الدور غير موجود"
        });
    }

    const user = await Model.findOne({ phone });

    if (
      !user ||
      user.resetOtp != otp || // تطابق الكود
      !user.resetOtpExpires ||
      user.resetOtpExpires < new Date() // تحقق من انتهاء صلاحية الكود
    ) {
      return res.status(400).send({
        status: false,
        message: lang == "en" ? "Invalid or expired OTP" : "الكود غير صحيح أو انتهت صلاحيته"
      });
    }

    // تحديث الباسورد (مع افتراض وجود bcrypt في pre-save)
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetOtp = undefined;
    user.resetOtpExpires = undefined;

    await user.save();

    res.status(200).send({
      code: 200,
      status: true,
      message: lang == "en" ? "Password reset successfully" : "تم تحديث الباسورد بنجاح"
    });
  } catch (err) {
    next(err);
  }
};
const changePassword = async (req, res, next) => {
  try {
    const lang = req.headers['accept-language'] || 'en';
    const role = req.user.role;
    const { error } = changePasswordSchema(lang).validate(req.body);
    if (error) {
      return res.status(400).json({
        status: false,
        code: 400,
        message: error.details[0].message
      });
    }
    const { oldPassword, newPassword } = req.body;
    const id = req.user.id;
    let Model;
    switch (role) {
      case 'user':
        Model = User;
        break;
      case 'serviceProvider':
        Model = serviceProvider;
        break;
      case 'rentalOffice':
        Model = rentalOffice;
        break;
      default:
        return res.status(400).send({
          status: false,
          code: 400,
          message: lang == "ar" ? "هذا الدور غير موجود" : "role must be serviceProvider or User or rentalOffice"
        });
    }
    const exist = await Model.findOne({ _id: id });
    const match = await bcrypt.compare(oldPassword, exist.password);
    if (!match) {
      return res.status(400).send({
        code: 400,
        status: false,
        message: lang == "en" ? "old password incorrect try again!" : "الباسورد القديمه غير صحيحه حاول مره اخرى"
      });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    exist.password = hashedPassword;
    await exist.save();
    return res.status(200).send({
      code: 200,
      status: true,
      message: lang == "en" ? "Password changed successfully" : "تم تحديث الباسورد بنجاح"
    })



  }
  catch (error) {
    next(error)
  }
}
const getProfileData = async (req, res, next) => {
  try {
    const lang = req.headers['accept-language'] || 'en';
    const role = req.user.role;
    const id = req.user.id;
    let Model;
    switch (role) {
      case 'user':
        Model = User;
        break;
      case 'serviceProvider':
        Model = serviceProvider;
        break;
      case 'rentalOffice':
        Model = rentalOffice;
        break;
      default:
        return res.status(400).send({
          status: false,
          code: 400,
          message: lang == "ar" ? "هذا الدور غير موجود" : "role must be serviceProvider or User or rentalOffice"
        });
    }
    const exist = await Model.findOne({ _id: id }).lean();
    let verification;
    let formatedData = { ...exist }
    if (role == "serviceProvider") {
      verification = await Winsh.findOne({ providerId: exist._id });
      if (!verification) {
        verification = await Tire.findOne({ providerId: exist._id });
      }
      formatedData = {
        ...exist,
        nationalId: verification.nationalId
      }
    }
    return res.status(200).send({
      status: true,
      code: 200,
      message: lang == "en" ? "Data retrieved successfully" : "تم جلب البيانات بنجاح",
      data: formatedData
    })

  }
  catch (error) {
    next(error)
  }
}
const editProfile = async (req, res, next) => {
  try {
    const lang = req.headers['accept-language'] || 'en';
    const id = req.user.id;
    const role = req.user.role;
    let Model;

    switch (role) {
      case 'user':
        Model = User;
        break;
      case 'rentalOffice':
        Model = rentalOffice;
        break;
      case 'serviceProvider':
        Model = serviceProvider;
        break;
      default:
        return res.status(400).send({
          status: false,
          code: 400,
          message: lang === "ar"
            ? "هذا الدور غير موجود"
            : "Role must be serviceProvider or User or rentalOffice"
        });
    }

    let updateData = {};

    // ✅ لو فيه يوزرنيم جديد
    if (req.body.username) updateData.username = req.body.username;

    // ✅ لو فيه إيميل جديد
    if (req.body.email) {
      const emailExists = await Model.findOne({ email: req.body.email, _id: { $ne: id } });
      if (emailExists) {
        return res.status(400).send({
          status: false,
          code: 400,
          message: lang === "en"
            ? "This email is already in use"
            : "هذا البريد الإلكتروني مستخدم بالفعل"
        });
      }
      updateData.email = req.body.email;
    }

    // ✅ لو فيه صورة جديدة
    if (req.file) {
      const file = req.file;
      const exist = await Model.findById(id);
      const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
      fs.unlinkSync(path.join("/var/www/images", exist.image || '')); // حذف الصورة القديمة لو موجودة
      const url = saveImage(file);
      updateData.image = `${BASE_URL}${url}`;
    }

    // ✅ لو مفيش حاجة للتحديث
    if (Object.keys(updateData).length === 0) {
      return res.status(400).send({
        status: false,
        code: 400,
        message: lang === "en"
          ? "No data provided to update"
          : "لم يتم إدخال أي بيانات للتحديث"
      });
    }

    // ✅ تحديث البيانات باستخدام الـ Model المناسب
    await Model.findByIdAndUpdate(id, updateData, { new: true });

    return res.send({
      status: true,
      code: 200,
      message: lang === "en"
        ? "Profile updated successfully"
        : "تم تحديث الملف الشخصي بنجاح"
    });

  } catch (error) {
    next(error);
  }
};
const logout = async (req, res, next) => {
  try {
    const lang = req.headers['accept-language'] || 'en';

    return res.status(200).send({
      status: true,
      code: 200,
      message: lang === "en" ? "Logged out successfully" : "تم تسجيل الخروج بنجاح"
    });
  } catch (err) {
    next(err);
  }
};
const userAsProvider = async (req, res, next) => {
  try {
    const lang = req.headers['accept-language'] || 'en';
    const id = req.user.id;
    const existUser = await User.findOne({ _id: id });
    if (!existUser) {
      return res.status(400).send({
        status: false,
        code: 400,
        message: lang == "ar" ? "هذا المستخدم غير موجود" : "this user does not exist"
      });
    }
    const file = req.file;
    if (!file) {
      return res.status(400).send({
        status: false,
        code: 400,
        message: lang == "ar" ? "الصوره مطلوبه" : "image is required"
      });
    }
    const { error } = userAsProviderSchema(lang).validate(req.body);
    if (error) {
      return res.status(400).send({
        status: false,
        code: 400,
        message: error.details[0].message
      });
    }
    let imageUrl;
    imageUrl = saveImage(file);
    console.log(imageUrl)
    imageUrl = `${process.env.BASE_URL}${imageUrl}`;
    await User.findByIdAndUpdate(id, {
      image: imageUrl,
      username: req.body.username,
      whatsAppNumber: req.body.whatsAppNumber,
      email: req.body.email,
      cityId: req.body.cityId,
      details: req.body.details,
      categoryCenterId: req.body.categoryCenterId,
      subCategoryCenterId: req.body.subCategoryCenterId,
      tradeRegisterNumber: req.body.tradeRegisterNumber,
      nationalId: req.body.nationalId

    });
    return res.status(200).send({
      status: true,
      code: 200,
      message: lang == "ar" ? "تم التقديم بنجاح" : "submitted successfully"
    });


  }
  catch (err) {
    next(err)
  }
}
const acceptUserAsProvider = async (req, res, next) => {
  try {
    const lang = req.headers['accept-language'] || 'en';
    const userId = req.params.userId;
    const existUser = await User.findOne({ _id: userId });
    if (!existUser) {
      return res.status(400).send({
        status: false,
        code: 400,
        message: lang == "ar" ? "هذا المستخدم غير موجود" : "this user does not exist"
      });
    }
    await User.findByIdAndUpdate(userId, { isProvider: true });
    return res.status(200).send({
      status: true,
      code: 200,
      message: lang == "ar" ? "تم القبول بنجاح" : "accepted successfully"
    });

  }
  catch (err) {
    next(err)
  }
}
const getCenters = async (req, res, next) => {
  try {
    const lang = req.headers['accept-language'] || 'en';
    const mainCategoryCenterId = req.params.id;
    console.log(mainCategoryCenterId)
    // 🟢 استقبل page و limit من query params
    const page = parseInt(req.query.page) || 1;  // الصفحة الحالية (افتراضي 1)
    const limit = parseInt(req.query.limit) || 10; // عدد العناصر في الصفحة (افتراضي 10)
    const skip = (page - 1) * limit;

    // 🟢 هات العدد الكلي عشان pagination info
    const totalCenters = await User.countDocuments({
      isProvider: true,
      categoryCenterId: mainCategoryCenterId
    });

    // 🟢 هات الـ centers بالـ pagination
    const centers = await User.find({
      isProvider: true,
      categoryCenterId: new mongoose.Types.ObjectId(mainCategoryCenterId)
    })
      .populate('categoryCenterId')
      .populate('subCategoryCenterId')
      .populate('cityId')
      .skip(skip)     // تجاهل العناصر اللي قبل الصفحة المطلوبة
      .limit(limit);  // هات بس limit عناصر
    console.log(centers)

    // IDs بتاعة كل المراكز
    const centerIds = centers.map(c => c._id);

    // الريفيوهات/التقييمات الخاصة بالمراكز
    const ratings = await RatingCenter.aggregate([
      { $match: { centerId: { $in: centerIds } } },
      {
        $group: {
          _id: "$centerId",
          avgRating: { $avg: "$rate" },
          count: { $sum: 1 }
        }
      }
    ]);

    // Map للـ ratings
    const ratingMap = {};
    ratings.forEach(r => {
      ratingMap[r._id.toString()] = {
        avgRating: r.avgRating,
        count: r.count
      };
    });

    // تجهيز الـ response النهائي
    const formatedCenters = centers.map(center => {
      const r = ratingMap[center._id.toString()] || { avgRating: 0, count: 0 };
      return {
        id: center._id,
        username: center.username,
        image: center.image,
        details: center.details,
        city: center.cityId?.name?.[lang] || "",
        category: center.subCategoryCenterId?.name?.[lang] || "",
        rating: r.avgRating ? Number(r.avgRating) : 0.0,
        ratingCount: r.count
      };
    });

    return res.status(200).send({
      status: true,
      code: 200,
      message: lang === "ar" ? "تم جلب البيانات بنجاح" : "Data retrieved successfully",
      data: {
        centers: formatedCenters,
        pagination: {
          page,
          totalPages: Math.ceil(totalCenters / limit)
        }
      },
    });
  }
  catch (err) {
    next(err);
  }
};
const getProfileDataForCenters = async (req,res,next)=>{
  try {
    const lang = req.headers["accept-language"] || "en";
    const centerId = req.params.id;
    const center= await User.findById(centerId).select('username image details location whatsAppNumber phone').populate("cityId").lean();
    const isFollowed= await centerFollower.findOne({userId:req.user.id,centerId:centerId});
    return res.status(200).send({
      status: true,
      code: 200,
      message: lang === "en"
        ? "center profile data retrieved successfully"
        : "تم استرجاع بيانات ملف المركز بنجاح",
      data:{
        ...center,
        cityId:undefined,
        city:center.cityId?.name?.[lang]||"",
        isFollowed:!!isFollowed
      }
    })
   
}
  catch (error) {
    next(error)
  }
}




module.exports = {
  register,
  login,
  requestResetPassword,
  resetPassword,
  changePassword,
  addLocationForProvider,
  getProfileData,
  editProfile,
  getCenters,
  acceptUserAsProvider,
  logout,
  userAsProvider,
  getProfileDataForCenters
}