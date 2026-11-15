const express = require('express');
const router = express.Router();
const { addComment, getCommentsByBlogId, getAllComments, updateComment, deleteComment } = require('../controllers/commentController');

router.get('/', getAllComments);
router.post('/', addComment);
router.get('/:blogId', getCommentsByBlogId);
router.put('/:id', updateComment);
router.delete('/:id', deleteComment);

module.exports = router;
