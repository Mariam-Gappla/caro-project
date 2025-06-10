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
const jwt=require("jsonwebtoken");
app.use(express.json());
app.use("/images",express.static("./images"))
const authenticateToken = (req, res, next) => {
    if (req.originalUrl.includes('register') || req.originalUrl.includes('login') || req.originalUrl.includes('images')) {
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

//routes
app.use("/users",userRoutes);
app.use("/tweets",tweetRoutes);
app.use("/comments",commentRoutes);
app.use("/cars",cars);
app.use("/rentalOffice",rentalOffice);
app.use("/rentalOffice/followers",rentalOfficeFollower);
app.use("/rentalOffice/orders",rentalOfficeOrders);


// handel error
app.use((err,req,res,next)=>{
    res.status(400).send({
        status: 400, // Fixed: res.statusCode was undefined, so set it directly
        message: err.message || 'Something went wrong',
    })
})

const port=3000;
app.listen(port,async()=>{
    await connectDB();
    console.log(`Server is running on port ${port}`);
})