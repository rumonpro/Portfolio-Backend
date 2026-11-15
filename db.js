const mongoose = require('mongoose');
require('dotenv').config();

// Disable buffering so queries fail fast without hanging 10s when DB is offline
mongoose.set('bufferCommands', false);

const connectDB = async () => {
    try {
        if (!process.env.MONGO_URI) {
            console.warn('Warning: MONGO_URI is not defined. Database features will be unavailable.');
            return;
        }
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`MongoDB Connection Error: ${error.message}`);
        console.warn('Server will continue running, but database features will be unavailable until MongoDB is connected.');
    }
};

module.exports = connectDB;
