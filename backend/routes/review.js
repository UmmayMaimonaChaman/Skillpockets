const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const reviewController = require('../controllers/reviewController');

// Create a new review
router.post('/', auth, reviewController.createReview);

// Get all reviews for a user (by userId param)
router.get('/user/:userId', reviewController.getReviewsForUser);

// Get all reviews written by the logged-in user
router.get('/mine', auth, reviewController.getMyReviews);

module.exports = router; 