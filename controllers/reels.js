const Reel = require("../models/reels");
const ReelComment=require("../models/reelsComment");
const ReelReply=require("../models/reelsReply");
const getReels = async (req, res, next) => {
  try {
    const lang = req.headers["accept-language"] || "en";

    // نجيب الريلز
    const reels = await Reel.find({}).populate("createdBy");

    // نجيب IDs بتاعة الريلز
    const reelIds = reels.map((r) => r._id);

    // نجيب التعليقات المرتبطة بالريلز
    const comments = await ReelComment.find({ reelId: { $in: reelIds } });
    const commentIds = comments.map((c) => c._id);

    // نجيب الردود المرتبطة بالتعليقات
    const replies = await ReelReply.find({ commentId: { $in: commentIds } });

    // نحسب المجموع لكل ريل
    const commentsCountMap = {};
    comments.forEach((comment) => {
      const reelId = comment.reelId.toString();
      if (!commentsCountMap[reelId]) commentsCountMap[reelId] = { comments: 0, replies: 0 };
      commentsCountMap[reelId].comments++;
    });

    replies.forEach((reply) => {
      const comment = comments.find((c) => c._id.toString() === reply.commentId.toString());
      if (comment) {
        const reelId = comment.reelId.toString();
        if (!commentsCountMap[reelId]) commentsCountMap[reelId] = { comments: 0, replies: 0 };
        commentsCountMap[reelId].replies++;
      }
    });

    const formatedReels = reels.map((rel) => {
      const counts = commentsCountMap[rel._id.toString()] || { comments: 0, replies: 0 };
      return {
        id: rel._id,
        title: rel.title,
        video: rel.video,
        likes: rel.likedBy.length,
        totalCommentsAndReplies: counts.comments + counts.replies,
        userData: {
          username: rel.createdBy.username,
          image: rel.createdBy.image,
        },
      };
    });

    return res.status(200).send({
      status: true,
      code: 200,
      message:
        lang === "en"
          ? "Reels retrieved successfully"
          : "تم استرجاع الريلز بنجاح",
      data: formatedReels,
    });
  } catch (error) {
    next(error);
  }
};

const addLike = async (req, res, next) => {
  try {
    const lang = req.headers["accept-language"] || "en";
    const userId = req.user.id;
    const reelId = req.params.id;
    const existReel = await Reel.findOne({ _id: reelId });
    if (!existReel) {
      return res.status(400).send({
        status: 400,
        code: false,
        message: lang == "en" ? "this reel not found" : "هذا الريلز غير موجود"
      });
    }
    const alreadyLiked = existReel.likedBy.includes(userId);
    let updatedRentalOffice;
    if (alreadyLiked) {
      // Remove the like
      updatedRentalOffice = await Reel.findByIdAndUpdate(
        reelId,
        { $pull: { likedBy: userId } },
        { new: true }
      );
    } else {
      // Add the like
      updatedRentalOffice = await Reel.findByIdAndUpdate(
        reelId,
        { $addToSet: { likedBy: userId } }, // $addToSet prevents duplicates
        { new: true }
      );
    }
    return res.status(200).send({
      status: true,
      code: 200,
      message: alreadyLiked
        ? lang === "en"
          ? "Like removed successfully"
          : "تم إزالة الإعجاب بنجاح"
        : lang === "en"
          ? "Like added successfully"
          : "تم إضافة الإعجاب بنجاح",
    });

  }
  catch (err) {
    next(err)
  }
}
module.exports = {
  getReels,
  addLike
}


