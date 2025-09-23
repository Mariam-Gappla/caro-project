const mongoose = require("mongoose");

const favoriteSchema = mongoose.Schema({
  userId: {
    type: mongoose.Types.ObjectId,
    required: true,
    ref: "User",
  },
  entityId: {
    type: mongoose.Types.ObjectId,
    required: true,
    refPath:'entityType'
  },
  entityType: {
    type: String,
    required: true,
    enum: ["User", "Post","ShowRoomPosts","rentalOffice","CarRental","CarPlate"], // ممكن تزودي أنواع تانية
  },
}, { timestamps: true });

const Favorite = mongoose.model("Favorite", favoriteSchema);
module.exports = Favorite;
