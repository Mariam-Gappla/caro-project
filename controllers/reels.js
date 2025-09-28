const ShowroomPosts = require("../models/showroomPost");
const getReels = async (req, res, next) => {
  try {
    const lang = req.headers["accept-language"] || "en";

    const reels = await ShowroomPosts.aggregate([
      // 🟢 showroom
      { $match: { video: { $exists: true, $ne: "" } } },
      {
        $lookup: {
          from: "users",
          localField: "showroomId",
          foreignField: "_id",
          as: "userData"
        }
      },
      { $unwind: { path: "$userData", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          video: 1,
          details: { $ifNull: ["$title", ""] }, // 👈 بدل title
          createdAt: 1,
          type: { $literal: "showroom" },
          "userData._id": 1,
          "userData.username": 1,
          "userData.image": 1
        }
      },

      // 🟢 union مع posts
      {
        $unionWith: {
          coll: "posts",
          pipeline: [
            { $match: { video: { $exists: true, $ne: "" } } },
            {
              $lookup: {
                from: "users",
                localField: "userId",
                foreignField: "_id",
                as: "userData"
              }
            },
            { $unwind: { path: "$userData", preserveNullAndEmptyArrays: true } },
            {
              $project: {
                _id: 1,
                video: 1,
                details: { $ifNull: ["$title", ""] }, // 👈
                createdAt: 1,
                type: { $literal: "post" },
                "userData._id": 1,
                "userData.username": 1,
                "userData.image": 1
              }
            }
          ]
        }
      },

      // 🟢 union مع carrental
      {
        $unionWith: {
          coll: "carrentals",
          pipeline: [
            {
              $match: {
                videoCar: { $exists: true, $ne: "" }
              }
            },
            {
              $lookup: {
                from: "users",
                localField: "userId",
                foreignField: "_id",
                as: "userData"
              }
            },
            { $unwind: { path: "$userData", preserveNullAndEmptyArrays: true } },
            {
              $project: {
                _id: 1,
                videoCar: 1,
                details: { $ifNull: ["$carDescription", ""] }, // 👈
                createdAt: 1,
                type: { $literal: "carrental" },
                "userData._id": 1,
                "userData.username": 1,
                "userData.image": 1
              }
            }
          ]
        }
      },

      // 🟢 union مع searches
      {
        $unionWith: {
          coll: "searches",
          pipeline: [
            { $match: { video: { $exists: true, $ne: "" } } },
            {
              $lookup: {
                from: "users",
                localField: "userId",
                foreignField: "_id",
                as: "userData"
              }
            },
            { $unwind: { path: "$userData", preserveNullAndEmptyArrays: true } },
            {
              $project: {
                _id: 1,
                video: 1,
                details: { $ifNull: ["$details", ""] }, // 👈
                createdAt: 1,
                type: { $literal: "search" }, // 👈 غيرتها من carrental
                "userData._id": 1,
                "userData.username": 1,
                "userData.image": 1
              }
            }
          ]
        }
      },

      // 🔽 الترتيب حسب الأحدث
      { $sort: { createdAt: -1 } }
    ]);

    return res.status(200).send({
      status: true,
      code: 200,
      message:
        lang === "en"
          ? "Reels retrieved successfully"
          : "تم استرجاع الريلز بنجاح",
      data: reels,
    });
  } catch (error) {
    next(error);
  }
};
module.exports = {
  getReels
}


