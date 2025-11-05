const { handleMessage } = require("../controllers/chat");
const { placeBid } = require("../controllers/auctionOrder");
module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log("🔌 مستخدم اتصل:", socket.id);

    // استدعاء دوال بتتعامل مع أنواع مختلفة من الأحداث
    handleMessage(io, socket);
    placeBid(io, socket);

    // عند فصل الاتصال
    socket.on("disconnect", () => {
      console.log("❌ المستخدم خرج:", socket.id);
    });
  });
};