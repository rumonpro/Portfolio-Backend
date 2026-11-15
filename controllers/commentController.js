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

        if (isDbConnected()) {
            const comment = await Comment.create({
                blogId,
                name,
                email,
                message,
                website
            });
            return res.status(201).json(comment);
        }

        const comments = readData('comments');
        const newComment = {
            _id: Date.now().toString(),
            blogId,
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
        if (isDbConnected()) {
            const comments = await Comment.find({ blogId: req.params.blogId }).sort({ createdAt: -1 });
            return res.status(200).json(comments);
        }

        const comments = readData('comments')
            .filter(c => c.blogId === req.params.blogId)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        res.status(200).json(comments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all comments (Admin)
// @route   GET /api/comments
// @access  Public (Should be private in production)
const getAllComments = async (req, res) => {
    try {
        if (isDbConnected()) {
            const comments = await Comment.find().populate('blogId', 'title').sort({ createdAt: -1 });
            return res.status(200).json(comments);
        }

        const comments = readData('comments').sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        res.status(200).json(comments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a comment (Reply)
// @route   PUT /api/comments/:id
// @access  Public (Should be private in production)
const updateComment = async (req, res) => {
    try {
        const { reply } = req.body;
        if (isDbConnected()) {
            const comment = await Comment.findByIdAndUpdate(
                req.params.id,
                { reply },
                { new: true }
            );
            if (!comment) {
                return res.status(404).json({ message: 'Comment not found' });
            }
            return res.status(200).json(comment);
        }

        let comments = readData('comments');
        const index = comments.findIndex(c => c._id === req.params.id);
        if (index === -1) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        comments[index] = {
            ...comments[index],
            reply: reply,
            updatedAt: new Date().toISOString()
        };
        writeData('comments', comments);
        res.status(200).json(comments[index]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a comment
// @route   DELETE /api/comments/:id
// @access  Public (Should be private in production)
const deleteComment = async (req, res) => {
    try {
        if (isDbConnected()) {
            const comment = await Comment.findByIdAndDelete(req.params.id);
            if (!comment) {
                return res.status(404).json({ message: 'Comment not found' });
            }
            return res.status(200).json({ message: 'Comment deleted' });
        }

        let comments = readData('comments');
        const initialLength = comments.length;
        comments = comments.filter(c => c._id !== req.params.id);
        if (comments.length === initialLength) {
            return res.status(404).json({ message: 'Comment not found' });
        }
        writeData('comments', comments);
        res.status(200).json({ message: 'Comment deleted' });
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
