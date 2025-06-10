const mongoose=require("mongoose");
const rentalOfficeSchema= new mongoose.Schema({
    username:{
        required:true,
        type:"string",
    },
    email:{
        type:"string",
        required:true,
        unique:true,
        match:/^[a-zA-z0-9]+@[a-zA-Z0-9]+\.[a-zA-Z]{2,4}$/,
    },
     password:{
        type:"string",
        required:true,
    },
    image:{
        type:"string",
        default: "http://localhost:3000/images/rentalOffice.png",
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