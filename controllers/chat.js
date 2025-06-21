const Message = require("../models/messages");
const User = require("../models/user");
const RentalOffice = require("../models/rentalOffice");

exports.handleMessage = (io, socket) => {
  socket.on("send_message", async ({ from, to, message }) => {
    try {
      const fromUser = await User.findOne({ phone: from });
      const toUser = await RentalOffice.findOne({ phone: to });

      if (!fromUser || !toUser) {
        socket.emit("error_message", {
          message: "رقم المرسل أو المستقبل غير موجود في النظام",
        });
        return;
      }

      const roomId = [from, to].sort().join();
      socket.join(roomId);

      await Message.create({ from, to, message, roomId });

      // إرسال تأكيد للمرسل فقط
      socket.emit("message_sent_successfully", { from, message });

      // إرسال الرسالة للطرف الآخر فقط
      socket.to(roomId).emit("receive_message", { from, message });

    } catch (err) {
      console.error("Error in handleMessage:", err);
      socket.emit("error_message", { message: "حدث خطأ أثناء إرسال الرسالة" });
    }
  });
};
