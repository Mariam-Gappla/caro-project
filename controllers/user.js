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
const login = async (req, res, next) => {
    try {
        const lang = req.headers['accept-language'] || 'en';
        const messages = getMessages(lang);
        console.log(req.body)
        const { error } = loginSchema(lang).validate(req.body);
        if (error) {
            return res.status(400).send({
                code: 400,
                status: false,
                message: error.details[0].message
            })
        }
        const { phone, password, role } = req.body;
        if (role == "rentalOffice") {
            const existRentalOffice = await rentalOffice.findOne({ phone: phone });
            if (existRentalOffice) {
                const token = jwt.sign({ id: existRentalOffice._id, role: "rentalOffice" }, process.env.JWT_SECRET);
                return res.status(200).send({
                    code: 200,
                    status: true,
                    message: messages.login.success,
                    data: {
                        user: existRentalOffice,
                        token: token
                    },
                })
            }
            const existUser = await User.findOne({ phone: phone });

            const match = await bcrypt.compare(password, existUser.password);
            if (!match) {
                return res.status(400).send({
                    status: false,
                    code: 400,
                    message: messages.login.incorrectData
                });
            }
            const Office = await rentalOffice.create({
                username: existUser.username,
                phone: existUser.phone,
                password: existUser.password
            })
            const token = jwt.sign({ id: Office._id, role: "rentalOffice" }, "mysecret");
            res.status(200).send({
                status: true,
                code: 200,
                message: messages.login.success,
                data: {
                    user: Office,
                    token: token
                },
            })

        }
        else if (role == "serviceProvider") {
            const existServiceProvider = await serviceProvider.findOne({ phone });
            if (!existServiceProvider) {
                return res.status(400).send({
                    status: false,
                    code: 400,
                    message: messages.login.emailExists.serviceProvider
                })
            }
            const match = await bcrypt.compare(password, existServiceProvider.password);
            if (!match) {
                return res.status(400).send({
                    code: 400,
                    status: false,
                    message: messages.login.incorrectData
                });
            }
            const token = jwt.sign({ id: existServiceProvider._id, role: "serviceProvider" }, "mysecret");
            res.status(200).send({
                status: true,
                code: 200,
                message: messages.success,
                data: {
                    user: existServiceProvider,
                    token: token

                },
            })

        }
        else if (role == "user") {
            const existUser = await User.findOne({ phone });
            if (!existUser) {
                return res.status(400).send({
                    status: false,
                    code: 400,
                    message: messages.login.emailExists.user
                })
            }
            const match = await bcrypt.compare(password, existUser.password);
            if (!match) {
                return res.status(400).send({
                    code: 400,
                    status: false,
                    message: messages.login.incorrectData
                });
            }
            const token = jwt.sign({ id: existUser._id, role: "user" }, "mysecret");
            res.status(200).send({
                status: true,
                code: 200,
                message: messages.login.success,
                data: {
                    user: existUser,
                    token: token
                },
            })
        }
    }
    catch (err) {
        next(err)
    }
}
const requestResetPassword = async (req, res, next) => {
    try {
        const lang = req.headers['accept-language'] || 'en';
        const { phone, role } = req.body;
        let Model;

        switch (role) {
            case 'User':
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
            message: lang=="ar"?"تم ارسال الكود بنجاح":"Code sent successfully"
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
      case 'User':
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
             code:400,
             status: false, 
             message: lang=="en" ?"Invalid role":"هذا الدور غير موجود"
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
        message: lang=="en"?"Invalid or expired OTP":"الكود غير صحيح أو انتهت صلاحيته"
      });
    }

    // تحديث الباسورد (مع افتراض وجود bcrypt في pre-save)
    user.password = newPassword;
    user.resetOtp = undefined;
    user.resetOtpExpires = undefined;

    await user.save();

    res.status(200).send({
      status: true,
      message: lang=="en"?"Password reset successfully":"تم تحديث الباسورد بنجاح"
    });
  } catch (err) {
    next(err);
  }
};


module.exports = {
    register,
    login,
    requestResetPassword,
    resetPassword
}