const mongoose=require('mongoose');
const userSchema=new mongoose.Schema({
   username:{
        type:"string",
        required:true,
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
     role: { type: String },
     createdAt: { type: Date, default: Date.now },
});
const User=mongoose.model("User",userSchema);
module.exports=User;