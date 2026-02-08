const User = require('../models/User');
const bcrypt = require('bcryptjs');

// Get current user's profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Update current user's profile (name, password)
exports.updateProfile = async (req, res) => {
  try {
    const { name, password } = req.body;
    const update = {};
    if (name) update.name = name;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      update.password = await bcrypt.hash(password, salt);
    }
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { $set: update },
      { new: true, select: '-password' }
    );
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
}; 