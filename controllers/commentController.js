const Comment = require('../models/Comment');

// @desc    Add a comment
// @route   POST /api/comments
// @access  Public
const addComment = async (req, res) => {
    try {
        const { blogId, name, email, message, website } = req.body;

        if (!blogId || !name || !email || !message) {
            return res.status(400).json({ message: 'Please fill all required fields' });
        }

        const comment = await Comment.create({
            blogId,
            name,
            email,
            message,
            website
        });

        res.status(201).json(comment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get comments for a blog
// @route   GET /api/comments/:blogId
// @access  Public
const getCommentsByBlogId = async (req, res) => {
    try {
        const comments = await Comment.find({ blogId: req.params.blogId }).sort({ createdAt: -1 });
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
        const comments = await Comment.find().populate('blogId', 'title').sort({ createdAt: -1 });
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
        const comment = await Comment.findByIdAndUpdate(
            req.params.id,
            { reply },
            { new: true }
        );
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }
        res.status(200).json(comment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a comment
// @route   DELETE /api/comments/:id
// @access  Public (Should be private in production)
const deleteComment = async (req, res) => {
    try {
        const comment = await Comment.findByIdAndDelete(req.params.id);
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }
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
