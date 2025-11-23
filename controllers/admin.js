const Car = require("../models/car");
const CarPlate = require("../models/carPlate");
const Posts = require("../models/post");
const SlavgePost = require("../models/slavgePost");
const CarRental = require("../models/carRental");
const ShowRoomPosts = require("../models/showroomPost");
const Search = require("../models/searchForAnyThing");
//orders
const ServiceProviderOrders = require("../models/serviceProviderOrders");
const RentalOfficeOrders = require("../models/rentalOfficeOrders");
const AuctionOrder = require("../models/auctionOrder");
//rentalOffices
const RentalOffices = require("../models/rentalOffice");
//serviceproviders
const ServiceProviders = require("../models/serviceProvider");
const Winch = require("../models/winsh");
const Tire = require("../models/tire");
//user
const User = require("../models/user");
//report
const Report = require("../models/report");
//admin
const Admin = require("../models/admin");
const login = async (req, res, next) => {
    try {
        const data = req.body;
        const existAdmin = await Admin.findOne({ email: data.email });

        if (!existAdmin) {
            return res.status(400).send({
                status: false,
                code: 400,
                message: "this admin does not exist"
            });
        }

        // Get password from body
        const password = data.password;

        // Compare passwords
        const match = await bcrypt.compare(password, existAdmin.password);
        if (!match) {
            return res.status(400).send({
                code: 400,
                status: false,
                message: "email or password not correct"
            });
        }

        // Create token
        const token = jwt.sign(
            { id: existAdmin._id, role: "admin" },
            process.env.JWT_SECRET,
            { expiresIn: "7d" } // لو عايزة مدت انتهاء
        );

        return res.status(200).send({
            status: true,
            code: 200,
            message: "admin logged in successfully",
            data: {
                admin: {
                    id: existAdmin._id,
                    email: existAdmin.email,
                    name: existAdmin.name
                },
                token
            }
        });

    } catch (err) {
        next(err);
    }
};
const getAllPosts = async (req, res, next) => {
    try {
        const cars = await Car.countDocuments({});
        const carplates = await CarPlate.countDocuments({});
        const posts = await Posts.countDocuments({});
        const slavgePosts = await SlavgePost.countDocuments({});
        const carRentals = await CarRental.countDocuments({});
        const showroomPosts = await ShowRoomPosts.countDocuments({});
        const search = await Search.countDocuments({});
        return res.status(200).send({
            status: true,
            code: 200,
            message: "Posts retrieved successfully",
            data: {
                posts: cars + carplates + posts + slavgePosts + carRentals + showroomPosts + search
            }
        })

    }
    catch (err) {
        next(err)
    }
}
const getAllOrders = async (req, res, next) => {
    try {
        const serviceProviderOrders = await ServiceProviderOrders.countDocuments({});
        const rentalOfficeOrders = await RentalOfficeOrders.countDocuments({});
        const auctionOrder = await AuctionOrder.countDocuments({});
        return res.status(200).send({
            status: true,
            code: 200,
            message: "orders retrieved successfully",
            data: {
                posts: serviceProviderOrders + rentalOfficeOrders + auctionOrder
            }
        })

    }
    catch (err) {
        next(err)
    }
}
const getRentalOffice = async (req, res, next) => {
    try {
        const rentalOffice = await RentalOffices.find({
            status: { $in: ["accepted", "refused"] }
        })
        const result = await rentalOffice.map(item => ({
            id: item._id,
            username: item.username,
            image: item.image,
            status: item.status,
            type: "مكتب تأجير"
        }));
        return res.status(200).send({
            status: true,
            code: 200,
            message: "your request retrieved successfully",
            data: result
        })
    }
    catch (err) {
        next(err);
    }
}
const deleteRentalOffice = async (req, res, next) => {
    try {
        const id = req.query.params.id;
        await RentalOffices.findByIdAndDelete(id)
        return res.status(200).send({
            status: true,
            code: 200,
            message: "rentalOffice deleted successfully"
        })
    }
    catch (err) {
        next(err);
    }
}
const getServiceProviders = async (req, res, next) => {
    try {
        const serviceProviders = await ServiceProviders.find({
            status: { $in: ["accepted", "refused"] }
        });
        const result = await Promise.all(
            serviceProviders.map(async (provider) => {

                const winch = await Winch.findOne({ providerId: provider._id });
                const tire = winch ? null : await Tire.findOne({ providerId: provider._id });

                return {
                    id: provider._id,
                    username: provider.username,
                    image: provider.image,
                    status: provider.status,
                    type: winch ? winch.serviceType : tire ? tire.serviceType : null
                };
            })
        );
        return res.status(200).send({
            status: true,
            code: 200,
            message: "Your request retrieved successfully",
            data: result
        });

    } catch (err) {
        next(err);
    }
};
const deleteServiceProvider = async (req, res, next) => {
    try {
        const id = req.query.params.id;
        await ServiceProviders.findByIdAndDelete(id)
        return res.status(200).send({
            status: true,
            code: 200,
            message: "serviceProvider deleted successfully"
        })
    }
    catch (err) {
        next(err);
    }
}
const getUsers = async (req, res, next) => {
    try {
        const status = req.query.status;
        const users = await User.find({ status: status }).select("username phone");
        const result = users.map((item) => {
            return {
                id: item._id,
                username: item.username,
                phone: item.phone,
            }
        });
        return res.status(200).send({
            status: true,
            code: 200,
            message: "Your request retrieved successfully",
            data: result
        })

    }
    catch (err) {
        next(err)
    }
}
const deleteUser = async (req, res, next) => {
    try {
        const id = req.query.params.id;
        await User.findByIdAndDelete(id);
        return res.status(200).send({
            status: true,
            code: 200,
            message: "user deleted successfully",
        })

    }
    catch (err) {
        next(err)
    }
}
const getReports = async (req, res, next) => {
    try {
        const reports = await Report.find().sort({ createdAt: -1 });

        const result = await Promise.all(
            reports.map(async (report) => {

                let entityData = null;

                if (report.entityType === "Post") {
                    entityData = await Posts.findById(report.entityId);
                }

                if (report.entityType === "ShowRoomPosts") {
                    entityData = await ShowRoomPosts.findById(report.entityId);
                }

                if (report.entityType === "Car") {
                    entityData = await Car.findById(report.entityId);
                }

                if (report.entityType === "CarPlate") {
                    entityData = await CarPlate.findById(report.entityId);
                }

                return {
                    reportid: report._id,
                    contentId: entityData._id,
                    reason: report.reason,
                    isViolation: report.isViolation,
                    status: report.status,
                    entityType: report.entityType,
                };
            })
        );

        return res.status(200).send({
            status: true,
            code: 200,
            message: "Reports retrieved successfully",
            data: result
        });

    } catch (err) {
        next(err);
    }
};
const getReportDetails = async (req, res, next) => {
    try {
        const id = req.body.id;
        const type = req.body.type;
        let entityData = null;
        if (type === "Post") {
            entityData = await Posts.findById(id).populate('userId');
        }

        if (type === "ShowRoomPosts") {
            entityData = await ShowRoomPosts.findById(id).populate('showroomId').populate("cityId");
        }

        if (type === "Car") {
            entityData = await Car.findById(id).populate('userId');
        }

        if (type === "CarPlate") {
            entityData = await CarPlate.findById(id).populate('userId');
        }
        if (type == "ShowRoomPosts") {
            const result = entityData.map((item) => {
                return {
                    id: item._id,
                    image: item.images,
                    video: item?.video || "undefined",
                    title: item.title,
                    price: item.price,
                    userData: {
                        id: item.showroomId._id,
                        username: item.showroomId.username,
                        image: item.showroomId.image,
                        status: item.showroomId.status
                    }
                }
            });
            return res.status(200).send({
                status: true,
                code: 200,
                message: "your request retrieved successfully",
                data: result
            })
        }
        const result = entityData.map((item) => {
            return {
                id: item._id,
                image: item.images,
                video: item?.video || "undefined",
                title: item.title,
                price: item.price,
                city: item.cityId.name,
                userData: {
                    id: item.userId._id,
                    username: item.userId.username,
                    image: item.userId.image,
                    status: item.userId.status
                }
            }
        });
        return res.status(200).send({
            status: true,
            code: 200,
            message: "your request retrieved successfully",
            data: result
        })

    }
    catch (err) {
        next(err)
    }
}