const { connectToDatabase } = require('../_lib/db');
const { auth, runMiddleware } = require('../_lib/middleware');
const User = require('../../backend/models/User');
const bcrypt = require('bcryptjs');

module.exports = async (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    try {
        await connectToDatabase();
        await runMiddleware(req, res, auth);

        if (req.method === 'GET') {
            // Get current user's profile
            const user = await User.findById(req.user.userId).select('-password');
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            return res.json(user);
        } else if (req.method === 'PUT') {
            // Update current user's profile
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

            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            return res.json(user);
        } else {
            return res.status(405).json({ message: 'Method not allowed' });
        }
    } catch (err) {
        console.error('Profile error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};
