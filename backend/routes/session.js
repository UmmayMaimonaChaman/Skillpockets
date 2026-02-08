const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const sessionController = require('../controllers/sessionController');

// Create a new session
router.post('/', auth, sessionController.createSession);

// Get all sessions for the logged-in user
router.get('/', auth, sessionController.getUserSessions);

// Update a session (reschedule/cancel/complete)
router.put('/:id', auth, sessionController.updateSession);

module.exports = router; 