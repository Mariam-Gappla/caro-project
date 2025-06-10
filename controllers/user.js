const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { registerSchema, loginSchema } = require("../validation/registerAndLoginSchema");
const rentalOffice = require("../models/rentalOffice");
const serviceProvider = require("../models/serviceProvider")
const register = async (req, res, next) => {
    try {
        console.log(req.body);
        const { error } = registerSchema.validate(req.body);
        if (error) {
            return res.status(400).send({
                status: res.statusCode,
                message: error.details[0].message
            })
        }
        const { username, email, password, confirmPassword, role } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        if (role == "rentalOffice") {
            const existRentalOffice = await rentalOffice.findOne({ email: email });
            if (existRentalOffice) {
                return res.status(400).send({
                    status: 400,
                    message: "هذا المكتب موجود من قبل"
                })
            }
            await rentalOffice.create({
                username,
                email,
                password: hashedPassword
            });
            return res.status(200).send({
                status: 200,
                message: "تم انشاء الحساب بنجاح"
            });

        }
        else if (role == "serviceProvider") {
            const existServiceProvider = await serviceProvider.findOne({ email: email });
            if (existServiceProvider) {
                return res.status(400).send({
                    status: 400,
                    message: "موفر الخدمه موجود من قبل"
                })
            }
            await serviceProvider.create({
                username,
                email,
                password: hashedPassword
            });
            return res.status(200).send({
                status: 200,
                message: "تم انشاء الحساب بنجاح"
            });
        }
        else if (role == "user") {
            const existUser = await User.findOne({ email: email });
            if (existUser) {
                return res.status(400).send({
                    status: 400,
                    message: "هذا المستخدم موجود من قبل"
                })
            }
            await User.create({
                username,
                email,
                password: hashedPassword
            });
            return res.status(200).send({
                status: 200,
                message: "تم انشاء الحساب بنجاح"
            });
        }
        else {
            return res.status(400).send({
                status: 400,
                message: "الدور يجب أن يكون إما rentalOffice أو serviceProvider أو user"
            });
        }
    }
    catch (err) {
        next(err);
    }
}
const login = async (req, res, next) => {
    try {
        const { error } = loginSchema.validate(req.body);
        if (error) {
            return res.status(400).send({
                status: res.statusCode,
                message: error.details[0].message
            })
        }
        const { email, password, role } = req.body;
        if (role == "rentalOffice") {
            const existRentalOffice = await rentalOffice.findOne({ email: email });
            if (!existRentalOffice) {
                return res.status(400).send({
                    status: 400,
                    message: "هذا المكتب لم يكن موجود يرجى انشاء حساب"
                })
            }
            const match = await bcrypt.compare(password, existRentalOffice.password);
            if (!match) {
                return res.status(401).send({
                    status: res.statusCode,
                    message: "البيانات المدخلة غير صحيحة، الرجاء التأكد من البريد الإلكتروني وكلمة المرور"
                });
            }
            const token = jwt.sign({ id: existRentalOffice._id, role: "rentalOffice" }, "mysecret");
            res.status(200).send({
                status: res.statusCode,
                message: "تم تسجيل الدخول بنجاح",
                data: { ...existRentalOffice._doc, token: token }
            })

        }
        else if (role == "serviceProvider") {
            const existServiceProvider = await serviceProvider.findOne({ email: email });
            if (!existServiceProvider) {
                return res.status(400).send({
                    status: 400,
                    message: "موفر الخدمه لم يكن موجود من قبل يرجى انشاء حساب"
                })
            }
            const match = await bcrypt.compare(password, existServiceProvider.password);
            if (!match) {
                return res.status(401).send({
                    status: res.statusCode,
                    message: "البيانات المدخلة غير صحيحة، الرجاء التأكد من البريد الإلكتروني وكلمة المرور"
                });
            }
            const token = jwt.sign({ id: existServiceProvider._id, role: "serviceProvider" }, "mysecret");
            res.status(200).send({
                status: res.statusCode,
                message: "تم تسجيل الدخول بنجاح",
                data: { ...existServiceProvider._doc, token: token }
            })

        }
        else if (role == "user") {
            const existUser = await User.findOne({ email: email });
            if (!existUser) {
                return res.status(400).send({
                    status: 400,
                    message: "هذا المستخدم لم يكن موجود من قبل يرجى انشاء حساب"
                })
            }
            const match = await bcrypt.compare(password, existUser.password);
            if (!match) {
                return res.status(401).send({
                    status: res.statusCode,
                    message: "البيانات المدخلة غير صحيحة، الرجاء التأكد من البريد الإلكتروني وكلمة المرور"
                });
            }
            const token = jwt.sign({ id: existUser._id, role:"user" }, "mysecret");
            res.status(200).send({
                status: res.statusCode,
                message: "تم تسجيل الدخول بنجاح",
                data: { ...existUser._doc, token: token }
            })
        }
        else {
            return res.status(400).send({
                status: 400,
                message: "الدور يجب أن يكون إما rentalOffice أو serviceProvider أو user"
            });
        }
    }
    catch (err) {
        next(err)
    }
}
module.exports = {
    register,
    login
}