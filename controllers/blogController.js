const mongoose = require('mongoose');
const Blog = require('../models/Blog');
const { isDbConnected, readData, writeData } = require('../utils/storage');

exports.getBlogs = async (req, res) => {
    try {
        if (isDbConnected()) {
            const blogs = await Blog.find({ published: true }).sort({ createdAt: -1 });
            if (blogs && blogs.length > 0) return res.json(blogs);
        }
        const blogs = readData('blogs')
            .filter(b => b.published !== false)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        res.json(blogs);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getAllBlogs = async (req, res) => {
    try {
        if (isDbConnected()) {
            const blogs = await Blog.find().sort({ createdAt: -1 });
            if (blogs && blogs.length > 0) return res.json(blogs);
        }
        const blogs = readData('blogs').sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        res.json(blogs);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getBlogById = async (req, res) => {
    try {
        const id = req.params.id;
        if (isDbConnected()) {
            if (mongoose.isValidObjectId(id)) {
                const blog = await Blog.findById(id);
                if (blog) return res.json(blog);
            }
            const blog = await Blog.findOne({ _id: id });
            if (blog) return res.json(blog);
        }

        const blogs = readData('blogs');
        const blog = blogs.find(b => String(b._id) === String(id));
        if (!blog) {
            return res.status(404).json({ message: 'Blog not found' });
        }
        res.json(blog);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.createBlog = async (req, res) => {
    try {
        if (isDbConnected()) {
            const blog = new Blog(req.body);
            const newBlog = await blog.save();
            return res.status(201).json(newBlog);
        }

        const blogs = readData('blogs');
        const newBlog = {
            _id: Date.now().toString(),
            title: req.body.title,
            content: req.body.content,
            author: req.body.author || 'Admin',
            image: req.body.image || '',
            tags: Array.isArray(req.body.tags)
                ? req.body.tags
                : (req.body.tags ? req.body.tags.split(',').map(s => s.trim()) : []),
            published: req.body.published !== undefined ? req.body.published : true,
            createdAt: new Date().toISOString()
        };

        blogs.unshift(newBlog);
        writeData('blogs', blogs);
        res.status(201).json(newBlog);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.updateBlog = async (req, res) => {
    try {
        const id = req.params.id;
        if (isDbConnected() && mongoose.isValidObjectId(id)) {
            const blog = await Blog.findByIdAndUpdate(id, req.body, { new: true });
            if (blog) return res.json(blog);
        }

        let blogs = readData('blogs');
        const index = blogs.findIndex(b => String(b._id) === String(id));
        if (index === -1) {
            return res.status(404).json({ message: 'Blog not found' });
        }

        const updated = {
            ...blogs[index],
            ...req.body,
            updatedAt: new Date().toISOString()
        };
        blogs[index] = updated;
        writeData('blogs', blogs);
        res.json(updated);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.deleteBlog = async (req, res) => {
    try {
        const id = req.params.id;
        if (isDbConnected() && mongoose.isValidObjectId(id)) {
            await Blog.findByIdAndDelete(id);
            return res.json({ message: 'Blog deleted' });
        }

        let blogs = readData('blogs');
        const initialLength = blogs.length;
        blogs = blogs.filter(b => String(b._id) !== String(id));
        if (blogs.length === initialLength) {
            return res.status(404).json({ message: 'Blog not found' });
        }
        writeData('blogs', blogs);
        res.json({ message: 'Blog deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
