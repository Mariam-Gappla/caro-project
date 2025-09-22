const mongoose = require("mongoose");
const reportSchema = new mongoose.Schema({
  userId: { type: mongoose.Types.ObjectId, ref: "User", required: true },   // مين اللي بلغ
  entityId: { type: mongoose.Types.ObjectId, required: true },              // البوست أو الكومنت
  entityType:{ type: String, enum: ["Post","ShowRoomPosts"], required: true },
  isViolation:{type:Boolean,default:false},                           // هل تم التأكد من وجود مخالفة
  reason: { type: String, required: true },                                 // سبب الإبلاغ
  status: { type: String, enum: ["Pending", "Reviewed", "Rejected"], default: "Pending" }
}, { timestamps: true });
const Report = mongoose.model("Report", reportSchema);
module.exports = Report;
