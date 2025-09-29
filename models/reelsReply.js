const mongoose=require('mongoose');
const ReelReplySchema=new mongoose.Schema({
    content:{
        type:String,
        required:true,
    },
    commentId:{
        type:mongoose.Types.ObjectId,
        required:true,
       ref:'ReelComment'
    },
    userId:{
        type:mongoose.Types.ObjectId,
        required:true,
        ref:'User'
    }
},{timestamps:true});
const CenterReply=mongoose.model('ReelReply',ReelReplySchema);
module.exports=CenterReply;