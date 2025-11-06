const mongoose = require("mongoose");
const auctionOrderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    targetType: {
      type: String,
      enum: ["Car", "CarPlate"],
      required: true,
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
       refPath:"targetType",
      required: true,
    },
    fixedPrice:{
      type:Boolean,
      default:false
    },
    price: {
      type: Number,
      required: true,
    },
    status:{
      type:String,
      enum:["pending","accepted","refused"],
      default:"pending"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("AuctionOrder", auctionOrderSchema);
