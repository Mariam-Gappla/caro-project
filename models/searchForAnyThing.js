const mongoose = require("mongoose");
const searchSchema = new mongoose.Schema({
  title: { type: String, required: true },
  images: { type: [String], required: true },
  details: { type: String, required: true },
  contactMethods: {
    type: [String],
    enum: ["WhatsApp", "Call", "Chat"],
    required: true,
  },
  price:{type:Number},
  cityId:{type:mongoose.Schema.Types.ObjectId,required:true,ref:"City"},
  phoneNumber: { type: String },
  postNumber:{type:Number},
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  status: { type: String, enum: ["pendding", "accepted", "refused"], default: "pendding" }
}, { timestamps: true });

const Search = mongoose.model("Search", searchSchema);
module.exports = Search;
