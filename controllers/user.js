const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { registerSchema, loginSchema } = require("../validation/registerAndLoginSchema");
const rentalOffice = require("../models/rentalOffice");
const getMessages = require("../configration/getmessages");
const serviceProvider = require("../models/serviceProvider");
const register = async (req, res, next) => {
  try {
    const lang = req.headers['accept-language'] || 'en';
    const messages = getMessages(lang);
    const { error } = registerSchema(lang).validate(req.body);
    if (error) {
      return res.status(400).send({
        status: false,
        code: 400,
        message: error.details[0].message
      })
    }
    const token = req.headers.authorization?.split(" ")[1];
    decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { identifier } = decoded;
    const { username, email, password, phone, role } = req.body;
    console.log(req.body)
    const hashedPassword = await bcrypt.hash(password, 10);
    if (role == "serviceProvider") {
      const existServiceProvider = await serviceProvider.findOne({ phone });
      if (existServiceProvider) {
        return res.status(400).send({
          code: 400,
          status: false,
          message: messages.register.emailExists.serviceProvider
        })
      }
      await serviceProvider.create({
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
    else if (role == "user") {
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
          user: existRentalOffice,
          token
        }
      });
    }

    // ----------------------
    // الحالة: Service Provider
    // ----------------------
    if (role === "serviceProvider") {
      const existServiceProvider = await serviceProvider.findOne({ phone });
      if (!existServiceProvider) {
        return res.status(400).send({
          status: false,
          code: 400,
          message: messages.login.emailExists.serviceProvider
        });
      }

      const match = await bcrypt.compare(password, existServiceProvider.password);
      if (!match) {
        return res.status(400).send({
          code: 400,
          status: false,
          message: messages.login.incorrectData
        });
      }
       const { location,resetOtp,resetOtpExpires, ...userWithoutLocation } = existServiceProvider.toObject();
      const token = jwt.sign({ id: existServiceProvider._id, role: "serviceProvider" }, process.env.JWT_SECRET);
      return res.status(200).send({
        code: 200,
        status: true,
        message: messages.login.success,
        data: {
          user: userWithoutLocation,
          token
        }
      });
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

      const match = await bcrypt.compare(password, existUser.password);
      if (!match) {
        return res.status(400).send({
          code: 400,
          status: false,
          message: messages.login.incorrectData
        });
      }

      const token = jwt.sign({ id: existUser._id, role: "user" }, process.env.JWT_SECRET);
      return res.status(200).send({
        code: 200,
        status: true,
        message: messages.login.success,
        data: {
          user: existUser,
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


module.exports = {
  register,
  login,
  requestResetPassword,
  resetPassword,
  addLocationForProvider,
  logout
}