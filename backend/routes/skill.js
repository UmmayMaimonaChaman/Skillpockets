const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const skillController = require('../controllers/skillController');

// Create a new skill
router.post('/', auth, skillController.createSkill);

// Get all skills
router.get('/', skillController.getAllSkills);

// Get my skills
router.get('/mine', auth, skillController.getMySkills);

// Get a single skill by ID
router.get('/:id', skillController.getSkillById);

// Update a skill (owner only)
router.put('/:id', auth, skillController.updateSkill);

// Delete a skill (owner only)
router.delete('/:id', auth, skillController.deleteSkill);

module.exports = router; 