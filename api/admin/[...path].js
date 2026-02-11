const { connectToDatabase } = require('../_lib/db');
const { auth, adminOnly, runMiddleware } = require('../_lib/middleware');
const User = require('../_models/User');
const Skill = require('../_models/Skill');
const Session = require('../_models/Session');
const Review = require('../_models/Review');
const SkillRequest = require('../_models/SkillRequest');
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
        await runMiddleware(req, res, adminOnly);

        const { path } = req.query;
        const pathStr = Array.isArray(path) ? path.join('/') : path || '';

        // Dashboard stats
        if (pathStr === 'dashboard-stats' && req.method === 'GET') {
            const totalUsers = await User.countDocuments({ role: 'user' });
            const totalAdmins = await User.countDocuments({ role: 'admin' });
            const bannedUsers = await User.countDocuments({ isBanned: true });
            const reportedUsers = await User.countDocuments({ isReported: true });
            const totalSkills = await Skill.countDocuments();
            const totalSessions = await Session.countDocuments();
            const totalReviews = await Review.countDocuments();
            const totalRequests = await SkillRequest.countDocuments();

            return res.json({
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
        }

        // Get all users
        if (pathStr === 'users' && req.method === 'GET') {
            const users = await User.find({}).select('-password');
            return res.json(users);
        }

        // Create new user
        if (pathStr === 'users' && req.method === 'POST') {
            const { name, email, password, role = 'user' } = req.body;
            let user = await User.findOne({ email });
            if (user) {
                return res.status(400).json({ message: 'User already exists' });
            }
            const hashedPassword = await bcrypt.hash(password, 10);
            user = new User({ name, email, password: hashedPassword, role });
            await user.save();
            const userResponse = user.toObject();
            delete userResponse.password;
            return res.status(201).json(userResponse);
        }

        // Get user by ID
        if (pathStr.startsWith('users/') && !pathStr.includes('toggle-ban') && req.method === 'GET') {
            const userId = pathStr.split('/')[1];
            const user = await User.findById(userId).select('-password');
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            return res.json(user);
        }

        // Update user
        if (pathStr.startsWith('users/') && !pathStr.includes('toggle-ban') && req.method === 'PUT') {
            const userId = pathStr.split('/')[1];
            const { name, email, password, role, isBanned, isReported } = req.body;
            let user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            if (name) user.name = name;
            if (email) user.email = email;
            if (role) user.role = role;
            if (typeof isBanned === 'boolean') user.isBanned = isBanned;
            if (typeof isReported === 'boolean') user.isReported = isReported;
            if (password) {
                user.password = await bcrypt.hash(password, 10);
            }
            await user.save();
            const userResponse = user.toObject();
            delete userResponse.password;
            return res.json(userResponse);
        }

        // Delete user
        if (pathStr.startsWith('users/') && !pathStr.includes('toggle-ban') && req.method === 'DELETE') {
            const userId = pathStr.split('/')[1];
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            if (user._id.toString() === req.user.userId) {
                return res.status(400).json({ message: 'Cannot delete your own account' });
            }
            await User.findByIdAndDelete(userId);
            return res.json({ message: 'User deleted successfully' });
        }

        // Toggle user ban
        if (pathStr.includes('toggle-ban') && req.method === 'PUT') {
            const userId = pathStr.split('/')[1];
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            user.isBanned = !user.isBanned;
            await user.save();
            const userResponse = user.toObject();
            delete userResponse.password;
            return res.json(userResponse);
        }

        // Get all skills
        if (pathStr === 'skills' && req.method === 'GET') {
            const skills = await Skill.find({}).populate('owner', 'name email').sort({ createdAt: -1 });
            return res.json(skills);
        }

        // Delete skill
        if (pathStr.startsWith('skills/') && req.method === 'DELETE') {
            const skillId = pathStr.split('/')[1];
            const skill = await Skill.findById(skillId);
            if (!skill) {
                return res.status(404).json({ message: 'Skill not found' });
            }
            await Skill.findByIdAndDelete(skillId);
            return res.json({ message: 'Skill deleted successfully' });
        }

        // Get all sessions
        if (pathStr === 'sessions' && req.method === 'GET') {
            const sessions = await Session.find({})
                .populate('skill', 'title')
                .populate('requester', 'name email')
                .populate('owner', 'name email')
                .populate('request')
                .sort({ createdAt: -1 });
            return res.json(sessions);
        }

        // Delete session
        if (pathStr.startsWith('sessions/') && req.method === 'DELETE') {
            const sessionId = pathStr.split('/')[1];
            const session = await Session.findById(sessionId);
            if (!session) {
                return res.status(404).json({ message: 'Session not found' });
            }
            await Session.findByIdAndDelete(sessionId);
            return res.json({ message: 'Session deleted successfully' });
        }

        // Get all reviews
        if (pathStr === 'reviews' && req.method === 'GET') {
            const reviews = await Review.find({})
                .populate('reviewer', 'name email')
                .populate('reviewee', 'name email')
                .populate('session')
                .sort({ createdAt: -1 });
            return res.json(reviews);
        }

        // Delete review
        if (pathStr.startsWith('reviews/') && req.method === 'DELETE') {
            const reviewId = pathStr.split('/')[1];
            const review = await Review.findById(reviewId);
            if (!review) {
                return res.status(404).json({ message: 'Review not found' });
            }
            await Review.findByIdAndDelete(reviewId);
            return res.json({ message: 'Review deleted successfully' });
        }

        return res.status(404).json({ message: 'Route not found' });
    } catch (err) {
        console.error('Admin API error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};
