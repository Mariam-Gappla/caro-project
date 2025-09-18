const mongoose=require('mongoose');
const centerReplySchema=new mongoose.Schema({
    content:{
        type:String,
        required:true,
    },
    commentId:{
        type:mongoose.Types.ObjectId,
        required:true,
       ref:'CenterComment'
    },
    userId:{
        type:mongoose.Types.ObjectId,
        required:true,
        ref:'User'
    }
},{timestamps:true});
const CenterReply=mongoose.model('CenterReply',centerReplySchema);
module.exports=CenterReply;