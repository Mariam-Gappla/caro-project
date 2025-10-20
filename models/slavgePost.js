const mongoose = require("mongoose")
const salvagePostSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        details: {
            type: String,
            required: true
        },
        location: {
            type: {
                type: String,
                enum: ["Point"],
                required: true,
            },
            coordinates: {
                type: [Number], // [longitude, latitude]
                required: true,
            },
        },
        images: [
            {
                type: String, // نخزن لينك الصورة (URL أو اسم الملف)
                required: true,
            },
        ],
        ended:{
          type:Boolean,
          default:false,
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
    },
    { timestamps: true }
);

// نعمل إندكس جغرافي علشان queries زي near
salvagePostSchema.index({ location: "2dsphere" });

const SalvagePost = mongoose.model("SalvagePost", salvagePostSchema);
module.exports=SalvagePost;
