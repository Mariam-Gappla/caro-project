const CenterService = require("../models/centerServices");
const saveImage = require("../configration/saveImage");
const User=require("../models/user");
const followerCenter=require("../models/followerCenter");
const centerServiceSchema = require("../validation/centerServices");
const mongoose = require('mongoose');
const addCenterService = async (req, res, next) => {
    try {
        const lang = req.headers['accept-language'] || 'en';
        const BASE_URL = process.env.BASE_URL || 'http://localhost:3000/';
        const userId = req.user.id;
        req.body.location={
            lat:Number(req.body['location.lat']),
            long:Number(req.body['location.long'])
        }
        delete req.body['location.lat']
        delete req.body['location.long']
        const { error } = centerServiceSchema(lang).validate({
            ...req.body
        });
        if (error) {
            return res.status(400).send({
                code: 400,
                status: false,
                message: error.details[0].message
            });
        }
        const existenceCenterService = await CenterService.findOne({ centerId: userId });
        if (existenceCenterService) {
            return res.status(400).send({
                status: false,
                code: 400,
                message: lang == "en" ? "you add your service and allow for you one service" : "انت قمت بإضافه خدمه من قبل وهو مسموح لك بخدمه واحده"
            })
        }
        // الصور المرفوعة كملفات
        let imageUrls = []
        if (req.files["images"]) {
            imageUrls = req.files["images"].map(file => BASE_URL + saveImage(file));
        }
        if (imageUrls) {
            const urls = Array.isArray(imageUrls) ? imageUrls : [imageUrls];
            images = [...urls];
        }
        // 🟢 الفيديو
        let video = null;
        if (req.files["video"]) {
            video = BASE_URL + saveImage(req.files["video"]);
            images.push(video);
        }
        const newService = await CenterService.create({
            products: images,
            services: req.body.services.map(id => new mongoose.Types.ObjectId(id)),
            centerId: userId,
            location:req.body.location,
            details: req.body.details
        });
        const test = await CenterService.findOne({ centerId: userId }).populate("services");
        console.log("Populated services:", test.services);
        return res.status(200).send({
            status: true,
            code: 200,
            message: lang == "en" ? "Your service has been added successfully" : "تم اضافه خدمتك بنجاح"
        })

    }
    catch (err) {
        next(err)
    }
}
const getCenterServiceByCenterId = async (req, res, next) => {
    try {
        const lang = req.headers['accept-language'] || 'en';
        const userId=req.user.id
        const centerServiceId = req.params.id;
        const centerService = await CenterService.findOne({ centerId: centerServiceId }).populate("services").lean();
        const follower= await followerCenter.findOne({userId});
        if(!centerService)
        {
            return res.status(400).send({
                status:false,
                code:400,
                message:lang=="ar"?"لا توجد خدمات لهذا المركر":"this center does not have services"
            })
        }
        const user=await User.findOne({_id:centerServiceId});
        console.log("Populated services:", centerService.services);
        const { services, ...rest } = centerService;
        const formatedServices = services.map((ser) => {
            return {
                name: ser.name[lang],
                image: ser.image
            }
        })
        centerService.services = formatedServices;
        return res.status(200).send({
            status: true,
            code: 200,
            message: lang == "en" ? "Your request has been completed successfully" : "تمت معالجة الطلب بنجاح",
            data: {
                id: centerService._id,
                username:user.username,
                image:user.image,
                location:centerService.location,
                whatsAppNumber:user.whatsAppNumber,
                details: centerService.details,
                services: centerService.services,
                products: centerService.products,
                isfollowed:follower?true:false
            }
        })

    }
    catch (err) {
        next(err)
    }
}
module.exports = {
    addCenterService,
    getCenterServiceByCenterId
}