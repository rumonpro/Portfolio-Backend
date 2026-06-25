const express = require('express');
const cors = require('cors');
const connectDB = require('./db');
const mongoose = require('mongoose');
require('dotenv').config();

const path = require('path');

const app = express();

// Connect to Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, '../Frontend')));

// Routes
app.use('/api/blogs', require('./routes/blogRoutes'));
app.use('/api/projects', require('./routes/projectRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));
app.use('/api/comments', require('./routes/commentRoutes'));
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/contact', require('./routes/contactRoutes'));

// Basic Route
app.get('/', (req, res) => {
    const dbState = mongoose.connection.readyState;
    const states = {
        0: 'Disconnected',
        1: 'Connected',
        2: 'Connecting',
        3: 'Disconnecting'
    };
    res.json({
        api: 'running',
        mongoUriDefined: !!process.env.MONGO_URI,
        databaseState: states[dbState] || 'Unknown'
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = app;
