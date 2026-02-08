const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const skillRequestController = require('../controllers/skillRequestController');

// Create a new skill request
router.post('/', auth, skillRequestController.createSkillRequest);

// Get requests where user is owner (received requests)
router.get('/received', auth, skillRequestController.getReceivedRequests);

// Get requests where user is requester (sent requests)
router.get('/sent', auth, skillRequestController.getSentRequests);

// Update request status (accept/reject/cancel)
router.put('/:id/status', auth, skillRequestController.updateRequestStatus);

module.exports = router; 