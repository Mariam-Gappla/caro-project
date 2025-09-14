const Favorite = require("../models/favorite");
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
  const favoritesPost = await Favorite.find({ userId, entityType: "Post" }).populate('entityId');
  const favoriteCenters = await Favorite.find({ userId, entityType: "User" })
    .populate({
      path: "entityId",
      populate: {
        path: "categoryCenterId", // ده جوه الـ User
      },
    })
    .skip(skip)
    .limit(limit);

  const totalCount = await Favorite.countDocuments({ userId, entityType: "User" });
  const totalPages = Math.max(1, Math.ceil(totalCount / limit));
  const formatedFavorites = favoriteCenters.map((fav) => {
    const { entityId, ...rest } = fav;
    return {
      title: entityId.username,
      subTitle: entityId.categoryCenterId.name[lang],
      image: entityId.image
    }
  });
  return res.status(200).send({
    status: true,
    code: 200,
    data: {
      favorities: formatedFavorites,
      pagination: {
        page,
        totalPages
      }
    }
  })
}

module.exports = { toggleFavorite, getFavoritesForUser };
