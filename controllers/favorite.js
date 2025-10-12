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
  try {
    const lang = req.headers["accept-language"] || "en";
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    let title = "";
    // 🟢 هات الفيفوريتس الأساسية
    const favorites = await Favorite.find({ userId }).sort({ createdAt: -1 });

    // 🟢 populate لكل نوع entityType
    const populatedFavorites = await Promise.all(
      favorites.map(async (fav) => {
        if (fav.entityType === "User") {
          await fav.populate({
            path: "entityId",
            populate: { path: "categoryCenterId" },
          });
        } else if (fav.entityType === "Post") {
          await fav.populate({
            path: "entityId",
            populate: { path: "userId" },
          });
        } else if (fav.entityType === "ShowRoomPosts") {
          await fav.populate({
            path: "entityId",
            populate: { path: "showroomId" },
          });
        }
        else if (fav.entityType === "rentalOffice") {
          await fav.populate({
            path: "entityId",
          });
        }
        else if (fav.entityType === "CarRental") {
          await fav.populate({
            path: "entityId",
            populate: { path: "rentalOfficeId" }
          });
        }
        else if (fav.entityType === "Post") {
          await fav.populate({
            path: "entityId",
            populate: { path: "userId" },
          });
        }
        else if (fav.entityType === "CarPlate") {
          await fav.populate({
            path: "entityId",
            populate: { path: "userId" },
          });
        }
        else if (fav.entityType === "Car") {
          await fav.populate({
            path: "entityId",
            populate: { path: "userId" },
          });
        }
        else if (fav.entityType === "Search") {
          await fav.populate({
            path: "entityId",
            populate: { path: "userId" },
          });
        }
        return fav;
      })
    );

    // 🟢 format response
    const formattedFavorites = populatedFavorites.map((fav) => {
      const { entityType, entityId, createdAt } = fav;
      if (!entityId) return null;

      if (entityType === "User") {
        return {
          type: "center",
          title: entityId.username,
          subTitle: entityId.categoryCenterId?.name?.[lang] || "",
          image: entityId.image,
          createdAt,
        };
      }

      if (entityType === "Post") {
        return {
          type: "post",
          title: entityId.userId?.username || "",
          subTitle: entityId.title || "",
          image: entityId.userId?.image || "",
          createdAt,
        };
      }

      if (entityType === "ShowRoomPosts") {
        return {
          type: "showroomPost",
          title: entityId.showroomId?.username || "",
          subTitle: entityId.title || "",
          image: entityId.showroomId?.image || "",
          createdAt,
        };
      }
      if (entityType === "rentalOffice") {
        return {
          type: "rentalOffice",
          title: entityId.username || "",
          subTitle: lang == "en" ? "rental office" : "مكتب تاجير",
          image: entityId.image || "",
          createdAt,
        };
      }
      if (entityType === "CarRental") {
        return {
          type: "CarRental",
          title: entityId.rentalOfficeId.username || "",
          subTitle: req.query.title,
          image: entityId.images?.[0] || "",
          createdAt,
        };
      }
      if (entityType === "Search") {
        return {
          type: "search",
          title: entityId.userId.username,
          subTitle: lang=="en"?"search posts":"بوستات ابحثلى",
          image: entityId.userId.image,
          createdAt,
        };
      }
      if (entityType === "CarPlate") {
        return {
          type: "carPlate",
          title: entityId.userId.username,
          subTitle:lang=="en"?"CarPlate":"لوحات",
          image: entityId.userId.image,
          createdAt,
        };
      }
      if (entityType === "Car") {
        return {
          type: "car",
          title: entityId.userId.username,
          subTitle: lang=="en"?"Cars":"عربيات",
          image: entityId.userId.image,
          createdAt,
        };
      }


      return null;
    }).filter(Boolean);

    // 🟢 pagination
    const totalCount = formattedFavorites.length;
    const totalPages = Math.max(1, Math.ceil(totalCount / limit));
    const paginatedFavorites = formattedFavorites.slice(skip, skip + limit);

    return res.status(200).send({
      status: true,
      code: 200,
      data: {
        favorites: paginatedFavorites,
        pagination: {
          page,
          totalPages,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { toggleFavorite, getFavoritesForUser };
