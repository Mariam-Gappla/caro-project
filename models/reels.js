const mongoose=require("mongoose");

const reelsSchema = new mongoose.Schema(
  {
    video: { type: String, required: true }, // لينك أو اسم ملف الفيديو
    discription: { type: String, required: true },
    likedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // مرجع للمستخدمين اللي عملوا لايك
      },
    ],
    shareCount:{
      type:Number,
      default:0
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // صاحب الريل
      required: true,
    },
  },
  { timestamps: true }
);

module.exports =mongoose.model("Reel", reelsSchema);
