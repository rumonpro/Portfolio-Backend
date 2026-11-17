const mongoose = require('mongoose');
const Comment = require('../models/Comment');
const { isDbConnected, readData, writeData } = require('../utils/storage');

// @desc    Add a comment
// @route   POST /api/comments
// @access  Public
const addComment = async (req, res) => {
    try {
        const { blogId, name, email, message, website } = req.body;

        if (!blogId || !name || !email || !message) {
            return res.status(400).json({ message: 'Please fill all required fields' });
        }

        if (isDbConnected() && mongoose.isValidObjectId(blogId)) {
            try {
                const comment = await Comment.create({
                    blogId,
                    name,
                    email,
                    message,
                    website
                });
                return res.status(201).json(comment);
            } catch (e) {
                console.warn('DB comment create error, falling back to local file:', e.message);
            }
        }

        const comments = readData('comments');
        const newComment = {
            _id: Date.now().toString(),
            blogId: String(blogId),
            name,
            email,
            message,
            website: website || '',
            reply: '',
            createdAt: new Date().toISOString()
        };

        comments.unshift(newComment);
        writeData('comments', comments);
        res.status(201).json(newComment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get comments for a blog
// @route   GET /api/comments/:blogId
// @access  Public
const getCommentsByBlogId = async (req, res) => {
    try {
        const blogId = req.params.blogId;
        if (isDbConnected() && mongoose.isValidObjectId(blogId)) {
            try {
                const comments = await Comment.find({ blogId }).sort({ createdAt: -1 });
                if (comments && comments.length > 0) return res.status(200).json(comments);
            } catch (e) {
                console.warn('DB comments lookup error, falling back to local file:', e.message);
            }
        }

        const comments = readData('comments')
            .filter(c => String(c.blogId) === String(blogId))
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        res.status(200).json(comments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all comments (Admin)
// @route   GET /api/comments
// @access  Public
const getAllComments = async (req, res) => {
    try {
        if (isDbConnected()) {
            try {
                const comments = await Comment.find().populate('blogId', 'title').sort({ createdAt: -1 });
                if (comments && comments.length > 0) return res.status(200).json(comments);
            } catch (e) {
                console.warn('DB comments error:', e.message);
            }
        }

        const comments = readData('comments').sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        res.status(200).json(comments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a comment (Reply)
// @route   PUT /api/comments/:id
// @access  Public
const updateComment = async (req, res) => {
    try {
        const { reply } = req.body;
        const id = req.params.id;

        if (isDbConnected() && mongoose.isValidObjectId(id)) {
            const comment = await Comment.findByIdAndUpdate(
                id,
                { reply },
                { new: true }
            );
            if (comment) return res.status(200).json(comment);
        }

        let comments = readData('comments');
        const index = comments.findIndex(c => String(c._id) === String(id));
        if (index === -1) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        comments[index].reply = reply;
        writeData('comments', comments);
        res.status(200).json(comments[index]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a comment
// @route   DELETE /api/comments/:id
// @access  Public
const deleteComment = async (req, res) => {
    try {
        const id = req.params.id;
        if (isDbConnected() && mongoose.isValidObjectId(id)) {
            await Comment.findByIdAndDelete(id);
            return res.status(200).json({ message: 'Comment deleted successfully' });
        }

        let comments = readData('comments');
        const initialLength = comments.length;
        comments = comments.filter(c => String(c._id) !== String(id));
        if (comments.length === initialLength) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        writeData('comments', comments);
        res.status(200).json({ message: 'Comment deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    addComment,
    getCommentsByBlogId,
    getAllComments,
    updateComment,
    deleteComment
};
