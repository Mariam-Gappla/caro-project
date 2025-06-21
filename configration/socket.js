const { handleMessage } = require("../controllers/chat")
module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log("🟢 New client connected");
    handleMessage(io, socket);
  });
};