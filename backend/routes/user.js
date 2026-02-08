const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getProfile, updateProfile } = require('../controllers/userController');

// Get current user's profile
router.get('/profile', auth, getProfile);

// Update current user's profile
router.put('/profile', auth, updateProfile);

module.exports = router; 