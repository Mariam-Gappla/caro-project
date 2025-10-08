const mongoose=require("mongoose");
const ratingSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    entityId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        path:"entityType"
    },
    entityType: {
        type: String,
        enum: ["Post","CarPlate","Car"], // أو اللي انتي عايزاه
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    ques1: {
        type: Boolean,
    },
    ques2: {
        type: Boolean,
    },
    comment: {
        type: String,
    }
}, { timestamps: true });

module.exports= mongoose.model("RatingPost", ratingSchema);
