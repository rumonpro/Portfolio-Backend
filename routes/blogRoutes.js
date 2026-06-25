const express = require('express');
const router = express.Router();
const { getBlogs, getAllBlogs, getBlogById, createBlog, updateBlog, deleteBlog } = require('../controllers/blogController');

// Public routes
router.get('/', getBlogs); // Get published blogs only
router.get('/:id', getBlogById); // Get single blog

// Admin routes
router.post('/', createBlog); // Create new blog
router.put('/:id', updateBlog); // Update blog
router.delete('/:id', deleteBlog); // Delete blog
router.get('/admin/all', getAllBlogs); // Get all blogs (admin only)

module.exports = router;
