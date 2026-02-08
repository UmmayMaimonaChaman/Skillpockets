const express = require('express');
const router = express.Router();
const adminAuthController = require('../controllers/adminAuthController');

// Admin login
router.post('/login', adminAuthController.adminLogin);

module.exports = router; 