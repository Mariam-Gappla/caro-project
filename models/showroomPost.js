const showRoomPosts = new mongoose.Schema(
  {
    
  },
  {
    timestamps: true // بيضيف createdAt و updatedAt تلقائيًا
  }
);
const showRoom = mongoose.model("ShowRoomPosts", showRoomPosts);
module.exports = showRoom;