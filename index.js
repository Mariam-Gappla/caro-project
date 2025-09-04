const express = require("express");
const app = express();
const http = require("http");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const path=require("path");

const server = http.createServer(app);

// 🟢 MongoDB Connection
const connectDB = require("./configration/dbconfig.js");

// 🟢 Socket.IO
const socketConnection = require("./configration/socket.js");

// 🟢 Routes
const userRoutes = require("./routes/userroutes.js");
const tweetRoutes = require("./routes/tweetroutes.js");
const commentRoutes = require("./routes/commentroutes.js");
const cars = require("./routes/carRentalroutes.js");
const rentalOffice = require("./routes/rentalOfficeroutes.js");
const rentalOfficeFollower = require("./routes/followersForRentalOffice.js");
const rentalOfficeOrders = require("./routes/rentalOfficeOrdersroutes.js");
const replyOnComment = require("./routes/replyOnCommentroutes.js");
const contactUsRoutes = require("./routes/contactUsroutes.js");
const invoiceRoutes = require("./routes/invoiceroutes.js");
const ratingForOrderRoutes = require("./routes/raitingForOrder.js");
const verificationRoutes = require("./routes/verificationAccount.js");
const namesRoutes=require("./routes/carNameroutes.js");
const modelsRoutes=require("./routes/carModelroutes.js");
const typeRoutes=require("./routes/carTyperoutes.js");
const vehicleTypeRoutes = require("./routes/vehicleType.js");
const nationalityRoutes = require("./routes/nationalityroutes.js");
const chatRoutes = require("./routes/chat.js");
const otp = require("./routes/otproutes.js");
const notificationRoutes=require("./routes/notification.js");
const serviceProviderOrders= require("./routes/serviceProviderOrders.js");
const providerRatingRoutes = require("./routes/providerRating.js");
const workSessionRoutes = require("./routes/workSessionroutes.js");
const howToUseCaro=require("./routes/howToUseCaro.js");
const mainCategoriesActivityRoutes=require("./routes/mainCategoryActivity.js");
const subCategoriesActivitiesRoutes=require("./routes/subCategories.js");
const replyOnCommentForUser= require("./routes/replyOnCommentroutesForUser");
const commentForUser= require("./routes/commentForUser");
const postRoutes=require("./routes/postroutes.js");
const cityRoutes=require("./routes/city.js");
const areaRoutes=require("./routes/area.js");
const ServicesRoutes=require("./routes/service.js");
const MainCategoryCenterRoutes=require("./routes/mainCategoryCenter.js");
const SubCategoryCenterRoutes=require("./routes/subCategoryCenter.js");
const CenterRating=require("./routes/ratingCenter.js");
const CenterFollower=require("./routes/followerCenter.js");
const CenterServices=require("./routes/centerServices.js");
// 🟢 Middleware
app.use(express.json());

// 🛡️ JWT Authentication Middleware
const authenticateToken = (req, res, next) => {
  if (
    req.originalUrl.includes("login") ||
    req.originalUrl.includes("verify-otp") ||
    req.originalUrl.includes("send-otp") ||
    req.originalUrl.includes("images")||
    req.originalUrl.includes("request-reset-password")||
    req.originalUrl.includes("reset-password")||
    req.originalUrl.includes("logout")

  ) {
    return next(); // Skip auth for public routes
  }

  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) return res.status(401).send({ message: "No token provided" });

  try {
    const decoded = jwt.verify(token, "mysecret");
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).send({ message: "Invalid token" });
  }
};

app.use(authenticateToken);
app.use('/images', express.static(path.join(__dirname, 'images'), {
  setHeaders: (res, path) => {
    if (path.endsWith(".mp4")) {
      res.setHeader("Content-Type", "video/mp4");
      res.setHeader("Content-Disposition", "inline"); // 👈 يخلي الفيديو يتعرض مش ينزل
    }
  }
}));


// 🟢 Apply Routes
app.use("/otp", otp);
app.use("/users", userRoutes);
app.use("/tweets", tweetRoutes);
app.use("/comments", commentRoutes);
app.use("/cars", cars);
app.use("/rentalOffice", rentalOffice);
app.use("/followers", rentalOfficeFollower);
app.use("/orders", rentalOfficeOrders);
app.use("/replyoncomment", replyOnComment);
app.use("/contactus", contactUsRoutes);
app.use("/invoice", invoiceRoutes);
app.use("/ratingForOrder", ratingForOrderRoutes);
app.use("/verification", verificationRoutes);
app.use("/chat", chatRoutes);
app.use("/notification",notificationRoutes);
app.use("/carModels",modelsRoutes);
app.use("/carNames",namesRoutes);
app.use("/vehicleType", vehicleTypeRoutes);
app.use("/nationality", nationalityRoutes);
app.use("/serviceProviderOrders",serviceProviderOrders);
app.use("/providerRating", providerRatingRoutes);
app.use("/workSession", workSessionRoutes);
app.use("/HowToUseCaro",howToUseCaro);
app.use("/carTypes",typeRoutes);
app.use("/mainCategoriesActivity",mainCategoriesActivityRoutes);
app.use("/subCategories",subCategoriesActivitiesRoutes);
app.use("/replyOnCommentForUser",replyOnCommentForUser);
app.use("/commentForUser",commentForUser);
app.use("/posts",postRoutes);
app.use("/area",areaRoutes);
app.use("/city",cityRoutes);
app.use("/service",ServicesRoutes);
app.use("/mainCategoryCenter",MainCategoryCenterRoutes);
app.use("/subCategoryCenter",SubCategoryCenterRoutes);
app.use("/CenterRating",CenterRating);
app.use("/CenterFollower",CenterFollower);
app.use("/CenterServices",CenterServices);
// ❌ Global Error Handler
app.use((err, req, res, next) => {
  res.status(400).send({
    status: false,
    code: 400,
    message: err.message || "Something went wrong",
  });
});
// 🚀 Start the server
const port = 3000;
server.listen(port, async () => {
  await connectDB();
  console.log(`✅ Server is running on port ${port}`);
  socketConnection(server); // ← تفعيل socket.io هنا
});
