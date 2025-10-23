const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Otp = require("../models/otp");
const { registerSchema, loginSchema, registerProviderSchema } = require("../validation/registerAndLoginSchema");
const userAsAutoSalvageSchema = require("../validation/userAsAutoSalvagesValidition");
const Admin = require("../models/admin.js");
const CenterCategory= require("../models/mainCategoryCenter.js");
const changePasswordSchema = require("../validation/changePasswordValidition");
const workSession = require("../models/workingSession");
const rentalOffice = require("../models/rentalOffice");
const getMessages = require("../configration/getmessages");
const CenterFollower = require("../models/followerCenter");
const Favorite = require("../models/favorite");
const serviceProvider = require("../models/serviceProvider");
const RatingCenter = require("../models/ratingCenter");
const CenterService = require("../models/centerServices")
const userAsProviderSchema = require("../validation/userAsProviderValidition");
const Winsh = require("../models/winsh");
const MainCategoryCenter = require("../models/mainCategoryCenter");
const centerFollower = require("../models/followerCenter");
const Tire = require("../models/tire");
const path = require("path");
const fs = require("fs");
const Wallet = require("../models/wallet");
const { sendNotification, sendNotificationToMany } = require("../configration/firebase.js");
const { saveImage } = require("../configration/saveImage");
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
        const existWallet = await Wallet.findOne({ userId: existUser._id });
        console.log(existWallet)
        if (!existWallet) {
          await Wallet.create({ userId: existUser._id });
        }
        return res.status(400).send({
          status: false,
          code: 400,
          message: messages.register.emailExists.user
        })
      }
      const user = await User.create({
        username,
        email,
        password: hashedPassword,
        phone
      });
      await Wallet.create({ userId: user._id });

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

    const { phone, password, role, fcmToken } = req.body;

    // ----------------------
    // الحالة: Rental Office
    // ----------------------
    if (role === "rentalOffice") {
      console.log(phone)
      let existRentalOffice = await rentalOffice.findOne({phone:phone});
      console.log(existRentalOffice)
      if (!existRentalOffice) {
        return res.status(400).send({
          code: 400,
          status: false,
          message: lang === "en" ? "This rental office does not exist" : "هذا المكتب غير موجود"

        })
      }
      if(existRentalOffice.status === "refused"){
        return res.status(200).send({
          status: true,
          code: 200,
          message: lang === "en" ? "Your request has been rejected" : "تم رفض الطلب"
        });
      }
      if(existRentalOffice.status === "pending"){
        return res.status(400).send({
          status: false,
          code: 400,
          message: lang === "en" ? "Your request is under review" : "جارى مراجعه الطلب"
        });
      }

      // تحقق من الباسورد
      const match = await bcrypt.compare(password, existRentalOffice.password);
      if (!match) {
        return res.status(400).send({
          code: 400,
          status: false,
          message: messages.login.incorrectData
        });
      }
      await rentalOffice.findOneAndUpdate({ phone: phone }, { fcmToken: fcmToken })
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
          await serviceProvider.findOneAndUpdate({ phone: phone }, { fcmToken: fcmToken })
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
        await serviceProvider.findOneAndUpdate({ phone: phone }, { fcmToken: fcmToken });
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
      const existUser = await User.findOne({ phone }).populate("categoryCenterId");
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
      const following = await CenterFollower.find({ userId: existUser._id });
      const followers = await CenterFollower.find({ centerId: existUser._id });
      const favorite = await Favorite.find({ userId: existUser._id, entityType: "User" });
      let ratings;
      ratings = await RatingCenter.find({ centerId: existUser._id });
      const allRatings = ratings.map(r => r.rating);
      const avgRating =
        allRatings.length > 0
          ? allRatings.reduce((sum, r) => sum + r, 0) / allRatings.length
          : 0;
      await User.findOneAndUpdate({ phone: phone }, { fcmToken: fcmToken });
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
            avgRating: avgRating,
            favorite: favorite.length,
            followers: followers.length,
            following: following.length,
            createdAt: existUser.createdAt,
            subscribeAsRntalOffice: userAsRentalOffice ? true : false,
            categoryId: existUser.categoryCenterId?._id || "user",
            category: existUser.categoryCenterId?.name.en || "user",
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
    const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
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
      updateData.email = req.body.email;
    }

    // ✅ لو فيه صورة جديدة
    if (req.file) {
      const file = req.file;
      const exist = await Model.findById(id);
      if (exist && exist.image) {
        try {
          // شيل الـ BASE_URL + /images/ من بداية المسار
          const imageName = exist.image.replace(`${BASE_URL}/images/`, "");
          const oldPath = path.join("/var/www/images", imageName);

          if (fs.existsSync(oldPath)) {
            fs.unlinkSync(oldPath);
          }
        } catch (err) {
          console.error("⚠️ Failed to delete old image:", err.message);
        }
      }
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
        message: lang == "ar" ? "هذا المستخدم غير موجود" : "This user does not exist"
      });
    }

    const file = req.file;
    if (!file) {
      return res.status(400).send({
        status: false,
        code: 400,
        message: lang == "ar" ? "الصورة مطلوبة" : "Image is required"
      });
    }

    // ✅ استخرج lat,long من البودي
    const { lat, long } = req.body;

    if (!lat || !long) {
      return res.status(400).send({
        status: false,
        code: 400,
        message: lang == "ar" ? "الموقع (lat, long) مطلوب" : "Location (lat, long) is required"
      });
    }

    // ✅ جهز location object
    req.body.location = {
      type: "Point",
      coordinates: [parseFloat(long), parseFloat(lat)] // [longitude, latitude]
    };

    // ❌ امسح الـ lat,long علشان مش محتاجينهم في الموديل
    delete req.body.lat;
    delete req.body.long;

    // ✅ Validation بعد ما ضفت location
    const { error } = userAsProviderSchema(lang).validate(req.body);
    if (error) {
      return res.status(400).send({
        status: false,
        code: 400,
        message: error.details[0].message
      });
    }

    // ✅ حفظ الصورة
    let imageUrl = saveImage(file);
    imageUrl = `${process.env.BASE_URL}${imageUrl}`;

    await User.findByIdAndUpdate(id, {
      image: imageUrl,
      username: req.body.username,
      whatsAppNumber: req.body.whatsAppNumber,
      email: req.body.email,
      cityId: req.body.cityId,
      areaId: req.body.areaId,
      details: req.body.details,
      categoryCenterId: req.body.categoryCenterId,
      subCategoryCenterId: req.body.subCategoryCenterId,
      tradeRegisterNumber: req.body.tradeRegisterNumber,
      nationalId: req.body.nationalId,
      location: req.body.location // ✅ حفظ الموقع
    });
    /*
    const admin = await Admin.find({}); // أو حسب نظامك لو عندك أكتر من أدمن

    if (admin) {
      await sendNotificationToMany({
        target: admin,
        targetType: "admin",
        titleAr: "طلب تسجيل مقدم خدمة جديد",
        titleEn: "New Service Provider Registration",
        messageAr: `المستخدم ${existUser.username} قدّم طلب تسجيل كمقدم خدمة`,
        messageEn: `User ${existUser.username} has submitted a request to become a service provider`,
        lang: lang,
        actionType: "provider",
      });
    }
*/
    return res.status(200).send({
      status: true,
      code: 200,
      message: lang == "ar" ? "تم التقديم بنجاح" : "Submitted successfully"
    });

  } catch (err) {
    next(err);
  }
};
const acceptUserAsProvider = async (req, res, next) => {
  try {
    const lang = req.headers['accept-language'] || 'en';
    const userId = req.params.userId;
    const status = req.body.status; // accepted or refused

    const existUser = await User.findOne({ _id: userId });
    if (!existUser) {
      return res.status(400).send({
        status: false,
        code: 400,
        message: lang == "ar" ? "هذا المستخدم غير موجود" : "this user does not exist"
      });
    }
    
    if (status === "refused") {
      await sendNotification({
        target: existUser,
        targetType: "User",
        titleAr: "تم رفض طلبك",
        titleEn: "Your account has been refused",
        messageAr: "للأسف تم رفض طلبك كمقدم خدمة. يرجى مراجعة المعلومات المقدمة والمحاولة مرة أخرى",
        messageEn: "Unfortunately, your request to become a service provider has been refused. Please review the provided information and try again.",
        lang: lang,
        actionType: "provider",
      });
      return res.status(200).send({
        status: true,
        code: 200,
        message: lang == "ar" ? "تم رفض الطلب" : "request refused"
      });

    }
    
     
    else if (status === "accepted") {
      await User.findByIdAndUpdate(userId, { isProvider: true });
      await sendNotification({
        target: userId,
        targetType: "User",
        titleAr: "تمت الموافقة على حسابك ",
        titleEn: "Your account has been approved",
        messageAr: "تهانينا! تم قبولك كمقدم خدمة ويمكنك الآن استخدام التطبيق",
        messageEn: "Congratulations! Your account has been approved and is now active.",
        lang: lang,
        actionType: "provider",
      });
      
      return res.status(200).send({
        status: true,
        code: 200,
        message: lang == "ar" ? "تم القبول بنجاح" : "accepted successfully"
      });
    }
  }
  catch (err) {
    next(err)
  }
}
const getCenters = async (req, res, next) => {
  try {
    const lang = req.headers["accept-language"] || "en";
    const mainCategoryCenterId = req.params.id;
    const userId = req.user.id;

    // 🟢 pagination params
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // 🟢 lat/long
    const lat = parseFloat(req.query.lat);
    const long = parseFloat(req.query.long);

    // 🟢 filters
    const { cityId, search } = req.query;

    // 🟢 base match query
    const matchQuery = {
      isProvider: true,
      categoryCenterId: new mongoose.Types.ObjectId(mainCategoryCenterId),
      ...(cityId ? { cityId: new mongoose.Types.ObjectId(cityId) } : {}),
      ...(search ? { username: { $regex: search, $options: "i" } } : {}),
    };

    // 🟢 aggregation pipeline
    const pipeline = [];

    if (!isNaN(lat) && !isNaN(long)) {
      // لو فيه lat/long
      pipeline.push({
        $geoNear: {
          near: { type: "Point", coordinates: [long, lat] },
          distanceField: "distance",
          maxDistance: 5000, // 5 km
          spherical: true,
          query: matchQuery,
        },
      });
    } else {
      // لو مفيش lat/long
      pipeline.push({ $match: matchQuery });
    }

    pipeline.push(
      { $skip: skip },
      { $limit: limit },
      {
        $lookup: {
          from: "subcategorycenters",
          localField: "subCategoryCenterId",
          foreignField: "_id",
          as: "subCategoryCenterId",
        },
      },
      {
        $lookup: {
          from: "cities",
          localField: "cityId",
          foreignField: "_id",
          as: "cityId",
        },
      },
      {
        $project: {
          username: 1,
          image: 1,
          details: 1,
          location: 1,
          subCategoryCenterId: { $arrayElemAt: ["$subCategoryCenterId", 0] },
          cityId: { $arrayElemAt: ["$cityId", 0] },
          distance: 1,
        },
      }
    );

    const centers = await User.aggregate(pipeline);

    // 🟢 collect centerIds
    const centerIds = centers.map((c) => c._id.toString());

    const ratings = await RatingCenter.aggregate([
      {
        $addFields: {
          centerIdStr: { $toString: "$centerId" }
        }
      },
      {
        $match: { centerIdStr: { $in: centerIds } }
      },
      {
        $group: {
          _id: "$centerIdStr",
          avgRating: { $avg: "$rating" },
          count: { $sum: 1 },
        },
      },
    ]);

    console.log("✅ Ratings found:", ratings);

    // 🟢 rating map
    const ratingMap = {};
    ratings.forEach((r) => {
      ratingMap[r._id.toString()] = {
        avgRating: r.avgRating,
        count: r.count,
      };
    });

    // 🟢 format response with favorites
    const formattedCenters = await Promise.all(
      centers.map(async (center) => {
        const r = ratingMap[center._id.toString()] || { avgRating: 0, count: 0 };

        const existFavorite = await Favorite.findOne({
          userId: userId,
          entityId: center._id,
          entityType: "User",
        });

        return {
          id: center._id,
          username: center.username,
          image: center.image,
          details: center.details,
          city: center.cityId?.name?.[lang] || "",
          category: center.subCategoryCenterId?.name?.[lang] || "",
          rating: r.avgRating ? parseFloat(r.avgRating.toFixed(2)) : 0.0,
          isFavorite: !!existFavorite,
        };
      })
    );

    return res.status(200).send({
      status: true,
      code: 200,
      message:
        lang === "ar" ? "تم جلب البيانات بنجاح" : "Data retrieved successfully",
      data: {
        centers: formattedCenters,
        pagination: {
          page,
          totalPages: Math.ceil(centerIds.length / limit),
        },
      },
    });
  } catch (err) {
    next(err);
  }
};
const getProfileDataForCenters = async (req, res, next) => {
  try {
    const lang = req.headers["accept-language"] || "en";
    const centerId = req.params.id;
    const center = await User.findById(centerId).select('username image details location whatsAppNumber phone').populate("cityId").lean();
    const isFollowed = await centerFollower.findOne({ userId: req.user.id, centerId: centerId });
    return res.status(200).send({
      status: true,
      code: 200,
      message: lang === "en"
        ? "center profile data retrieved successfully"
        : "تم استرجاع بيانات ملف المركز بنجاح",
      data: {
        ...center,
        location: {
          long: center.location.coordinates[0],
          lat: center.location.coordinates[1],
        },
        cityId: undefined,
        city: center.cityId?.name?.[lang] || "",
        isFollowed: !!isFollowed
      }
    })

  }
  catch (error) {
    next(error)
  }
}
const userAsAutoSalvage = async (req, res, next) => {
  try {
    const lang = req.headers['accept-language'] || 'en';
    const id = req.user.id;

    const existUser = await User.findOne({ _id: id });
    if (!existUser) {
      return res.status(400).send({
        status: false,
        code: 400,
        message: lang == "ar" ? "هذا المستخدم غير موجود" : "This user does not exist"
      });
    }

    const file = req.file;
    if (!file) {
      return res.status(400).send({
        status: false,
        code: 400,
        message: lang == "ar" ? "الصورة مطلوبة" : "Image is required"
      });
    }
    if (!Array.isArray(req.body.brand)) {
      req.body.brand = [req.body.brand];
    }
    const { error } = userAsAutoSalvageSchema(lang).validate(req.body);
    if (error) {
      return res.status(400).send({
        status: false,
        code: 400,
        message: error.details[0].message
      });
    }

    // ✅ حفظ الصورة
    let imageUrl = saveImage(file);
    imageUrl = `${process.env.BASE_URL}${imageUrl}`;
    const centercategory = await MainCategoryCenter.find({})
    const existcategory = centercategory.find((cat) => cat.name.en == "Auto Salvage");
    await User.findByIdAndUpdate(id, {
      image: imageUrl,
      username: req.body.username,
      categoryCenterId: existcategory._id,
      brand: req.body.brand,
      service: req.body.service,
      cityId: req.body.cityId
    });
    /*
    const admin = await Admin.find({});
    await sendNotificationToMany({
      target: admin,
      targetType: "admin",
      titleAr: "طلب تسجيل مقدم خدمة تشليح جديد",
      titleEn: "New Scrap Service Provider Registration",
      messageAr: `المستخدم ${existUser.username} قدّم طلب تسجيل كمقدم خدمة تشليح`,
      messageEn: `User ${existUser.username} has submitted a request to become a scrap service provider`,
      lang: lang,
      actionType: "scrap_provider_request",
    });
    */
    return res.status(200).send({
      status: true,
      code: 200,
      message: lang == "ar" ? "تم التقديم بنجاح" : "Submitted successfully"
    });

  }
  catch (err) {
    next(err)
  }
}
const getUserData = async (req, res, next) => {
  try {
    const lang = req.headers['accept-language'] || 'en';
    const messages = getMessages(lang);
    const userId = req.user.id;

    const existUser = await User.findOne({ _id: userId });
    if (!existUser) {
      return res.status(400).send({
        status: false,
        code: 400,
        message: messages.login.emailExists.user
      });
    }
    const phone = existUser.phone;
    const userAsRentalOffice = await rentalOffice.findOne({ phone })
    const haveService = await CenterService.findOne({ centerId: existUser._id });
    return res.status(200).send({
      code: 200,
      status: true,
      message: lang == "en" ? "request get successfully" : "تم معالجه الطلب بنجاح",
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
          categoryId: existUser.categoryCenterId || "user",
          haveService: haveService ? true : false,
          role: existUser.isProvider ? "provider" : "user",
          createdAt: existUser.createdAt,
          updatedAt: existUser.updatedAt,
          __v: 0,

        },
      }
    });
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
  getProfileDataForCenters,
  getUserData,
  userAsAutoSalvage,
}