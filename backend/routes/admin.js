const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

// All routes require authentication and admin privileges
router.use(auth);
router.use(admin);

// Dashboard stats
router.get('/dashboard-stats', adminController.getDashboardStats);

// User CRUD operations
router.get('/users', adminController.getAllUsers);
router.get('/users/:id', adminController.getUserById);
router.post('/users', adminController.createUser);
router.put('/users/:id', adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);

// User management
router.put('/users/:id/toggle-ban', adminController.toggleUserBan);

// Skills management
router.get('/skills', adminController.getAllSkills);
router.delete('/skills/:id', adminController.deleteSkill);

// Sessions management
router.get('/sessions', adminController.getAllSessions);
router.delete('/sessions/:id', adminController.deleteSession);

// Reviews management
router.get('/reviews', adminController.getAllReviews);
router.delete('/reviews/:id', adminController.deleteReview);

module.exports = router; 