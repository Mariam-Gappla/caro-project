const mongoose = require("mongoose");
const searchSchema = new mongoose.Schema({
  title: { type: String, required: true },
  images: { type: [String], required: true },
  video: { type: String },
  details: { type: String, required: true },
  contactMethods: {
    type: [String],
    enum: ["WhatsApp", "Call", "Chat"],
    required: true,
  },
  price:{type:Number,required:true},
  cityId:{type:mongoose.Schema.Types.ObjectId,required:true,ref:"City"},
  phoneNumber: { type: String },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  status: { type: String, enum: ["pendding", "accepted", "refused"], default: "pendding" }
}, { timestamps: true });

const Search = mongoose.model("Search", searchSchema);
module.exports = Search;
