const mongoose = require("mongoose");
const postSchema = new mongoose.Schema({
    images: [{ type: String }],
    title: { type: String, required: true },
    description: { type: String, required: true },
    mainCategoryId: { type: mongoose.Schema.Types.ObjectId, ref: "MainCategory", required: true },
    subCategoryId: { type: mongoose.Schema.Types.ObjectId, ref: "SubCategory", required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    location: {
        lat: { type: Number, required: true },
        long: { type: Number, required: true },
    },
    priceType: { type: String, enum: ["fixed", "negotiable", "best"], default: "fixed", required: true },
    price: { type: Number },
    deposit: { type: Number, default: 0, required: true },
    contactType: {
        type: [String], // Array of strings
        enum: ["whatsapp", "call", "inAppChat"],
        required: true,
    },
    cityId: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: "City", 
        required: true
     },
    areaId: {  
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Area", 
        required: true
    },
    contactValue: {
        type: String,
    }
}, { timestamps: true });
module.exports = mongoose.model("Post", postSchema);