const express=require("express");
const app=express();
const connectDB=require('./configration/dbconfig.js');
const userRoutes=require("./routes/userroutes.js");
const tweetRoutes=require("./routes/tweetroutes.js");
const commentRoutes=require("./routes/commentroutes.js");
const cars=require("./routes/carRentalroutes.js");
const rentalOffice=require("./routes/rentalOfficeroutes.js");
const rentalOfficeFollower=require("./routes/followersForRentalOffice.js");
const rentalOfficeOrders=require("./routes/rentalOfficeOrdersroutes.js");
const replyOnComment=require("./routes/replyOnCommentroutes.js");
const contactUsRoutes=require("./routes/contactUsroutes.js");
const invoiceRoutes=require("./routes/invoiceroutes.js");
const ratingForOrderRoutes=require("./routes/raitingForOrder.js");
const verificationRoutes=require("./routes/verificationAccount.js");
const otp=require("./routes/otproutes.js");
const jwt=require("jsonwebtoken");
const http = require("http");
const socketIO = require("socket.io");
require('dotenv').config(); // لازم يكون في أول الكود
const server = http.createServer(app);
const heandelSocket=require("./configration/socket.js");
app.use(express.json());
app.use("/images",express.static("./images"))
const io = require("socket.io")(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const authenticateToken = (req, res, next) => {
    if (req.originalUrl.includes('login') || req.originalUrl.includes('verify-otp')|| req.originalUrl.includes('send-otp') || req.originalUrl.includes('images')) {
        console.log('Public route, skipping token check.');
        next();
    }
    else {
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).send({ message: 'No token provided' });
        }
        try {
            console.log(token);
            const decoded = jwt.verify(token, "mysecret");
            req.user = decoded;
            next();
        } catch (err) {
            return res.status(403).send({ message: 'Invalid token' });
        }
    }
};
app.use(authenticateToken);
heandelSocket(io)
//routes
app.use("/otp",otp);
app.use("/users",userRoutes);
app.use("/tweets",tweetRoutes);
app.use("/comments",commentRoutes);
app.use("/cars",cars);
app.use("/rentalOffice",rentalOffice);
app.use("/rentalOffice/followers",rentalOfficeFollower);
app.use("/orders",rentalOfficeOrders);
app.use("/replyoncomment",replyOnComment);
app.use("/contactus",contactUsRoutes);
app.use("/invoice",invoiceRoutes);
app.use("/ratingForOrder",ratingForOrderRoutes);
app.use("/verification",verificationRoutes);

// handel error
app.use((err,req,res,next)=>{
    res.status(400).send({
        status:false,
        code: 400, 
        message: err.message || 'Something went wrong',
    })
})

const port=3000;
server.listen(port, async () => {
  await connectDB();
  console.log(`✅ Server is running on port ${port}`);
});