const { required } = require("joi");
const mongoose=require("mongoose");
const rentalOfficeSchema= new mongoose.Schema({
    username:{
        required:true,
        type:String,
    },
    email:{
        type:String,
        match:/^[a-zA-z0-9]+@[a-zA-Z0-9]+\.[a-zA-Z]{2,4}$/,
    },
    phone:{
        type:String,
        required:true,
        unique:true
    },
     password:{
        type:String,
        required:true,
    },
    image:{
        type:String,
        default: `${process.env.BASE_URL}/images/rentalOffice.png`,
    },
    likedBy: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    }
  ],
    createdAt: { type: Date, default: Date.now },
});
const rentalOffice=mongoose.model("RentalOffice",rentalOfficeSchema);
module.exports=rentalOffice;