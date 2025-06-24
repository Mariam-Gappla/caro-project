const mongoose = require('mongoose');
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to mongodb atlas");
    } catch (err) {
        console.error("Error connecting to database:", err.message);
        process.exit(1); // Exit process with failure
    }
};

module.exports = connectDB;