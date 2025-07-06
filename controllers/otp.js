const Otp = require("../models/otp");
const jwt = require("jsonwebtoken");
const getMessages = require("../configration/getmessages");
const makeOtp = async (req, res, next) => {
    try {
        const { phone } = req.body;
        const lang = req.headers['accept-language'] || 'en';
        const messages = getMessages(lang);
        console.log(messages);
        const otp = 1111;
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
        await Otp.create({
            phone,
            otp,
            expiresAt
        });
        res.status(200).send({
            status: true,
            code: 200,
            message: messages.sendCode.success
        });
    }
    catch (err) {
        next(err)
    }
}
const verifyOtp = async (req, res, next) => {
    try {
        const { code, phone } = req.body;
        const lang = req.headers['accept-language'] || 'en';
        const messages = getMessages(lang);
        const existuser = await Otp.find({ phone });
        if (!existuser[0]) {
            return res.status(400).send({
                status: false,
                code: 400,
                message: messages.verify.notExist,

            })
        }
        const token = jwt.sign({ identifier: phone }, process.env.JWT_SECRET, { expiresIn: '1h' });
        if (!code || code == existuser[0].otp) {
            return res.status(200).send({
                status: true,
                code: 200,
                message: messages.verify.success,
                data: {
                    token
                }
            })
        }
        return res.status(200).send({
            status: true,
            code: 200,
            data: messages.verify.error

        })
    }
    catch (err) {
        next(err)
    }
}
module.exports = {
    makeOtp, verifyOtp
}