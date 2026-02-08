const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || user.role !== 'admin') {
      return res.status(401).json({ message: 'Invalid admin credentials' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid admin credentials' });
    }
    const token = jwt.sign(
      { userId: user._id, role: user.role, isAdmin: true },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.json({ 
      token, 
      user: { 
        id: user._id, 
        email: user.email, 
        name: user.name, 
        role: user.role 
      } 
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
}; 