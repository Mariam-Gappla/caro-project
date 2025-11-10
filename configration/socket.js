const { handleMessage } = require("../controllers/chat");
module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log("🔌 مستخدم اتصل:", socket.id);

    socket.on("sendLocation", async ({ userId, lat, long }) => {
      const user = await TrackingController.sendLocation(userId, lat, long);
      if (!user) return; // تجاهل لو مش مسموح بالإرسال

      io.emit("locationUpdate", { userId, lat, long });
    });
    handleMessage(io, socket);
    // عند فصل الاتصال
    socket.on("disconnect", () => {
      console.log("❌ المستخدم خرج:", socket.id);
    });
  });
};