const mongoose = require('mongoose');
const connectDB = async () => {
    try {
        await mongoose.connect("mongodb://127.0.0.1:27017/caro");
        console.log("Connected to database");
    } catch (err) {
        console.error("Error connecting to database:", err.message);
        process.exit(1); // Exit process with failure
    }
};

module.exports = connectDB;