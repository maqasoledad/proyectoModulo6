const express = require('express');
const router = express.Router();
const asyncHandler = require('../utils/asyncHandler');
const {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
} = require('../controllers/userController');

router.post('/', asyncHandler(createUser));
router.get('/', asyncHandler(getUsers));
router.get('/:id', asyncHandler(getUserById));
router.put('/:id', asyncHandler(updateUser));
router.delete('/:id', asyncHandler(deleteUser));

module.exports = router;
