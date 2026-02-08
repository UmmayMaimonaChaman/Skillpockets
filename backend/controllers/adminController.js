const User = require('../models/User');
const Skill = require('../models/Skill');
const Session = require('../models/Session');
const Review = require('../models/Review');
const SkillRequest = require('../models/SkillRequest');
const bcrypt = require('bcryptjs');

// Get all users (admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get single user by ID (admin only)
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Create new user (admin only)
exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role = 'user' } = req.body;

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    user = new User({
      name,
      email,
      password: hashedPassword,
      role
    });

    await user.save();

    // Return user without password
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json(userResponse);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Update user (admin only)
exports.updateUser = async (req, res) => {
  try {
    const { name, email, password, role, isBanned, isReported } = req.body;
    const userId = req.params.id;

    let user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (role) user.role = role;
    if (typeof isBanned === 'boolean') user.isBanned = isBanned;
    if (typeof isReported === 'boolean') user.isReported = isReported;

    // Update password if provided
    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }

    await user.save();

    // Return user without password
    const userResponse = user.toObject();
    delete userResponse.password;

    res.json(userResponse);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete user (admin only)
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent admin from deleting themselves
    if (user._id.toString() === req.user.userId) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Ban/Unban user (admin only)
exports.toggleUserBan = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isBanned = !user.isBanned;
    await user.save();

    const userResponse = user.toObject();
    delete userResponse.password;

    res.json(userResponse);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get admin dashboard stats
exports.getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalAdmins = await User.countDocuments({ role: 'admin' });
    const bannedUsers = await User.countDocuments({ isBanned: true });
    const reportedUsers = await User.countDocuments({ isReported: true });
    const totalSkills = await Skill.countDocuments();
    const totalSessions = await Session.countDocuments();
    const totalReviews = await Review.countDocuments();
    const totalRequests = await SkillRequest.countDocuments();

    res.json({
      totalUsers,
      totalAdmins,
      bannedUsers,
      reportedUsers,
      totalSkills,
      totalSessions,
      totalReviews,
      totalRequests,
      totalAccounts: totalUsers + totalAdmins
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all skills (admin only)
exports.getAllSkills = async (req, res) => {
  try {
    const skills = await Skill.find({})
      .populate('owner', 'name email')
      .sort({ createdAt: -1 });
    res.json(skills);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all sessions (admin only)
exports.getAllSessions = async (req, res) => {
  try {
    const sessions = await Session.find({})
      .populate('skill', 'title')
      .populate('requester', 'name email')
      .populate('owner', 'name email')
      .populate('request')
      .sort({ createdAt: -1 });
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all reviews (admin only)
exports.getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find({})
      .populate('reviewer', 'name email')
      .populate('reviewee', 'name email')
      .populate('session')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete skill (admin only)
exports.deleteSkill = async (req, res) => {
  try {
    const skill = await Skill.findById(req.params.id);
    if (!skill) {
      return res.status(404).json({ message: 'Skill not found' });
    }

    await Skill.findByIdAndDelete(req.params.id);
    res.json({ message: 'Skill deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete session (admin only)
exports.deleteSession = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    await Session.findByIdAndDelete(req.params.id);
    res.json({ message: 'Session deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete review (admin only)
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    await Review.findByIdAndDelete(req.params.id);
    res.json({ message: 'Review deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
}; 