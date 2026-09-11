const express = require('express');
const router = express.Router();
const asyncHandler = require('../utils/asyncHandler');
const {
  createPost,
  getPosts,
  getPostById,
  updatePost,
  deletePost,
} = require('../controllers/postController');

router.post('/', asyncHandler(createPost));
router.get('/', asyncHandler(getPosts));
router.get('/:id', asyncHandler(getPostById));
router.put('/:id', asyncHandler(updatePost));
router.delete('/:id', asyncHandler(deletePost));

module.exports = router;
