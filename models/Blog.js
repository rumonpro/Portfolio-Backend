const mongoose = require('mongoose');
const blogSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    author: { type: String, default: 'Admin' },
    image: { type: String },
    tags: [String],
    published: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Blog', blogSchema);
