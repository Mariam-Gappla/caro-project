const RatingPost=require("../models/ratingPost");
const {ratingSchema}=require("../validation/ratingValidition");
const addRating=async(req,res,next)=>{
    try
    {
        const lang = req.headers["accept-language"] || "en";
        const userId=req.user.id;
        req.body.userId=userId;
        const { error } = ratingSchema(lang).validate({ ...req.body, userId });
        if(error)
        {
            return res.status(400).send({
                status:false,
                code:400,
                message: error.details[0].message
            })
        }
       
        await RatingPost.create({...req.body});
        return res.status(200).send({
            status:true,
            code:200,
            message:lang=="en" ? "rating added successfuly" :"تم اضافع التقييم بنجاح"
        })

    }
    catch(err)
    {
        next(err)
    }
}
const getPostRatings = async (req, res, next) => {
  try {
    const lang = req.headers["accept-language"] || "en";
    const postId = req.params.id;
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    // هات بس الـ Post Ratings + userId
    const postRatings = await RatingPost.find({ entityId: postId })
      .select("rating createdAt userId") 
      .populate("userId", "username image") // نجيب بيانات المستخدم
      .lean();

    // رتب حسب التاريخ
    const sortedRatings = postRatings.sort((a, b) => b.createdAt - a.createdAt);

    // pagination
    const totalCount = sortedRatings.length;
    const paginatedRatings = sortedRatings.slice(skip, skip + limit);

    // شكل الداتا النهائي
    const customizedRatings = paginatedRatings.map(r => ({
      username: r.userId?.username,
      image: r.userId?.image,
      rating: r.rating,
      createdAt: r.createdAt,
    }));

    return res.status(200).send({
      status: true,
      code: 200,
       message: lang == "en"
          ? "Your request has been completed successfully"
          : "تمت معالجة الطلب بنجاح",
      data: {
        rating: customizedRatings,
        pagination: {
          page,
          totalPages: Math.ceil(totalCount / limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports={
    addRating,
    getPostRatings
}