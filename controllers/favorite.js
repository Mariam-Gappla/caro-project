const { populate } = require("dotenv");
const Favorite = require("../models/favorite");
const path = require("path");
const toggleFavorite = async (req, res, next) => {
  try {
    const lang = req.headers["accept-language"] || "en";
    const userId = req.user.id;
    const { entityId, entityType } = req.body;

    // check if already in favorites
    const favoriteExist = await Favorite.findOne({ userId, entityId, entityType });

    if (favoriteExist) {
      // remove favorite
      await Favorite.findOneAndDelete({ userId, entityId, entityType });
      return res.status(200).send({
        status: true,
        code: 200,
        message: lang === "ar" ? "تم الحذف من المفضلة" : "Removed from favorites",
      });
    } else {
      // add favorite
      await Favorite.create({ userId, entityId, entityType });
      return res.status(200).send({
        status: true,
        code: 200,
        message: lang === "ar" ? "تمت الإضافة إلى المفضلة" : "Added to favorites",
      });
    }
  } catch (err) {
    next(err);
  }
};
const getFavoritesForUser = async (req, res, next) => {
  const lang = req.headers["accept-language"] || "en";
  const userId = req.user.id;
  const page = req.query.page || 1;
  const limit = req.query.limit || 10;
  const skip = (page - 1) * limit;
  const favoritesPost = await Favorite.find({ userId, entityType: "Post" }).populate('entityId').populate("userId")
  const favoriteCenters = await Favorite.find({ userId, entityType: "User" })
    .populate({
      path: "entityId",
      populate: {
        path: "categoryCenterId", // ده جوه الـ User
      },
    })
  const formatedCenterFavorites = favoriteCenters.map((fav) => {
    const { entityId, ...rest } = fav;
      return {
        title: entityId.username,
        subTitle: entityId.categoryCenterId.name[lang],
        image: entityId.image
      }

  });
   const formatedPostsFavorites =  favoritesPost.map((fav) => {
    const { entityId,userId ,...rest } = fav;
      return {
        title: userId.username,
        subTitle: entityId.title,
        image: userId.image
      }

  });
  let allFavorites=[]
  allFavorites=[...formatedCenterFavorites,...formatedPostsFavorites]
    // Sort by date (optional)
    allFavorites.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Pagination
    const totalCount = allFavorites.length;
    const totalPages = Math.max(1, Math.ceil(totalCount / limit));
  return res.status(200).send({
    status: true,
    code: 200,
    data: {
      favorities: allFavorites,
      pagination: {
        page,
        totalPages
      }
    }
  })
}

module.exports = { toggleFavorite, getFavoritesForUser };
