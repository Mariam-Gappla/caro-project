const Message = require("../models/messages");
const User = require("../models/user");
const RentalOffice = require("../models/rentalOffice");
const ServiceProvider = require("../models/serviceProvider")
const getUserByTypeAndPhone = async (type, phone) => {
  if (type === "user") return await User.findOne({ phone });
  if (type === "rental") return await RentalOffice.findOne({ phone });
  if (type === "provider") return await ServiceProvider.findOne({ phone });
  return null;
};

const handleMessage = (io, socket) => {
  socket.on("send_message", async ({ from, to, message }) => {
    try {
      const fromUser = await getUserByTypeAndPhone(from.type, from.phone);
      const toUser = await getUserByTypeAndPhone(to.type, to.phone);

      if (!fromUser || !toUser) {
        return socket.emit("error_message", {
          message: "رقم المرسل أو المستقبل غير موجود في النظام",
        });
      }

      const roomId = [from.phone, to.phone].sort().join("_");

      // 🟢 انضم المستخدم للغرفة
      socket.join(roomId);

      const savedMessage = await Message.create({
        from: from.phone,
        to: to.phone,
        message,
        roomId,
      });

      // 🟢 أرسل للطرف الآخر داخل الغرفة
      socket.to(roomId).emit("receive_message", {
        from: from.phone,
        message,
        timestamp: savedMessage.timestamp,
      });

      // 🟢 أرسل تأكيد للمرسل
      socket.emit("message_sent_successfully", {
        message,
        timestamp: savedMessage.timestamp,
      });

    } catch (err) {
      console.error("❌ Error sending message:", err);
      socket.emit("error_message", {
        message: "حدث خطأ أثناء إرسال الرسالة",
      });
    }
  });
};


const allMessages = async (req, res, next) => {
  try {
    const chatId = req.params.chatId;
    const messages = await Message.find({ chatId }).sort({ timestamp: 1 });
    res.status(200).send({
      code: 200,
      status: true,
      messages: messages
    })
  } catch (err) {
    res.status(500).json({ error: "حدث خطأ أثناء جلب الرسائل" });
  }
}
module.exports = {
  handleMessage,
  allMessages
}
