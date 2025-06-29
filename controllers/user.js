const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { registerSchema, loginSchema } = require("../validation/registerAndLoginSchema");
const rentalOffice = require("../models/rentalOffice");
const getMessages=require("../configration/getmessages");
const serviceProvider = require("../models/serviceProvider")
const register = async (req, res, next) => {
    try {
        const lang = req.headers['accept-language'] || 'en';
        const messages=getMessages(lang);
        const { error } = registerSchema(lang).validate(req.body);
        if (error) {
            return res.status(400).send({
                status:false,
                code: 400,
                message: error.details[0].message
            })
        }
        const { username, email, password,phone, confirmPassword, role } = req.body;
        console.log(req.body)
        const hashedPassword = await bcrypt.hash(password, 10);
        if (role == "rentalOffice") {
            console.log(role)
            const existRentalOffice = await rentalOffice.findOne({phone });
            if (existRentalOffice) {
                return res.status(400).send({
                    code: 400,
                    status:false,
                    message: messages.register.emailExists.rentalOffice
                })
            }
            await rentalOffice.create({
                username,
                email,
                password: hashedPassword,
                phone
            });
            return res.status(200).send({
                code: 200,
                status:true,
                message: messages.register.createdSuccessfully
            });

        }
        else if (role == "serviceProvider") {
            const existServiceProvider = await serviceProvider.findOne({phone });
            if (existServiceProvider) {
                return res.status(400).send({
                    code:400,
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
                code:200,
                message: messages.register.createdSuccessfully
            });
        }
        else if (role == "user") {
            const existUser = await User.findOne({ phone });
            if (existUser) {
                return res.status(400).send({
                    status: false,
                    code:400,
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
                code:200,
                message: messages.register.createdSuccessfully
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
        const messages=getMessages(lang);
        const { error } = loginSchema(lang).validate(req.body);
        if (error) {
            return res.status(400).send({
                code:400,
                status: false,
                message: error.details[0].message
            })
        }
        const { phone,password, role } = req.body;
        if (role == "rentalOffice") {
            const existRentalOffice = await rentalOffice.findOne({ phone: phone });
            if (!existRentalOffice) {
                return res.status(400).send({
                    code:400,
                    status: false,
                    message: messages.login.emailExists.rentalOffice
                })
            }
            const match = await bcrypt.compare(password, existRentalOffice.password);
            if (!match) {
                return res.status(400).send({
                    status: false,
                    code:400,
                    message: messages.login.incorrectData
                });
            }
            const token = jwt.sign({ id: existRentalOffice._id, role: "rentalOffice" }, "mysecret");
            res.status(200).send({
                status:true,
                code:200,
                message: messages.login.success,
                data: { ...existRentalOffice._doc },
                token: token
            })

        }
        else if (role == "serviceProvider") {
            const existServiceProvider = await serviceProvider.findOne({ phone });
            if (!existServiceProvider) {
                return res.status(400).send({
                    status: false,
                    code:400,
                    message: messages.login.emailExists.serviceProvider
                })
            }
            const match = await bcrypt.compare(password, existServiceProvider.password);
            if (!match) {
                return res.status(400).send({
                    code:400,
                    status: false,
                    message: messages.login.incorrectData
                });
            }
            const token = jwt.sign({ id: existServiceProvider._id, role: "serviceProvider" }, "mysecret");
            res.status(200).send({
                status: true,
                code:200,
                message: messages.success,
                data: { ...existServiceProvider._doc},
               token: token 
            })

        }
        else if (role == "user") {
            const existUser = await User.findOne({ phone });
            if (!existUser) {
                return res.status(400).send({
                    status: false,
                    code:400,
                    message: messages.login.emailExists.user
                })
            }
            const match = await bcrypt.compare(password, existUser.password);
            if (!match) {
                return res.status(400).send({
                    code:400,
                    status: false,
                    message: messages.login.incorrectData
                });
            }
            const token = jwt.sign({ id: existUser._id, role:"user" }, "mysecret");
            res.status(200).send({
                status: true,
                code:200,
                message: messages.login.success,
                data: { 
                   user:existUser,
                    token: token 
                },
                token: token 
            })
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