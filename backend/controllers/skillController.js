const Skill = require('../models/Skill');

// Create a new skill
exports.createSkill = async (req, res) => {
  try {
    const { title, description, category, type, availability } = req.body;
    const skill = new Skill({
      title,
      description,
      category,
      type,
      availability,
      owner: req.user.userId,
    });
    await skill.save();
    res.status(201).json(skill);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all skills
exports.getAllSkills = async (req, res) => {
  try {
    const skills = await Skill.find().populate('owner', 'name email');
    res.json(skills);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get my skills
exports.getMySkills = async (req, res) => {
  try {
    const skills = await Skill.find({ owner: req.user.userId });
    res.json(skills);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get a single skill by ID
exports.getSkillById = async (req, res) => {
  try {
    const skill = await Skill.findById(req.params.id).populate('owner', 'name email');
    if (!skill) return res.status(404).json({ message: 'Skill not found' });
    res.json(skill);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Update a skill (owner or admin only)
exports.updateSkill = async (req, res) => {
  try {
    const skill = await Skill.findById(req.params.id);
    if (!skill) return res.status(404).json({ message: 'Skill not found' });
    
    // Allow admin to edit any skill, or owner to edit their own skill
    if (req.user.role !== 'admin' && skill.owner.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    const { title, description, category, type, availability } = req.body;
    if (title) skill.title = title;
    if (description) skill.description = description;
    if (category) skill.category = category;
    if (type) skill.type = type;
    if (availability) skill.availability = availability;
    await skill.save();
    res.json(skill);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete a skill (owner or admin only)
exports.deleteSkill = async (req, res) => {
  try {
    const skill = await Skill.findById(req.params.id);
    if (!skill) return res.status(404).json({ message: 'Skill not found' });
    
    // Allow admin to delete any skill, or owner to delete their own skill
    if (req.user.role !== 'admin' && skill.owner.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    await skill.deleteOne();
    res.json({ message: 'Skill deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
}; 