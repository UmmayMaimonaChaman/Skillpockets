const { connectToDatabase } = require('../_lib/db');
const { auth, runMiddleware } = require('../_lib/middleware');
const Session = require('../_models/Session');

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

        const { path } = req.query;
        const pathStr = Array.isArray(path) ? path.join('/') : path || '';

        // Get all sessions for the logged-in user
        if (!pathStr && req.method === 'GET') {
            const sessions = await Session.find({
                $or: [{ requester: req.user.userId }, { owner: req.user.userId }]
            })
                .populate('skill', 'title')
                .populate('requester', 'name email')
                .populate('owner', 'name email')
                .populate('request')
                .sort({ scheduledTime: -1 });
            return res.json(sessions);
        }

        // Create a new session
        if (!pathStr && req.method === 'POST') {
            const { skill, requester, owner, scheduledTime, request } = req.body;
            const newSession = new Session({
                skill,
                requester,
                owner,
                scheduledTime,
                status: 'scheduled',
                request
            });
            await newSession.save();
            return res.status(201).json(newSession);
        }

        // Update a session
        if (pathStr && req.method === 'PUT') {
            const session = await Session.findById(pathStr);
            if (!session) {
                return res.status(404).json({ message: 'Session not found' });
            }
            // Check if user is part of the session
            if (session.requester.toString() !== req.user.userId && session.owner.toString() !== req.user.userId) {
                return res.status(403).json({ message: 'Not authorized' });
            }
            const { scheduledTime, status } = req.body;
            if (scheduledTime) session.scheduledTime = scheduledTime;
            if (status) session.status = status;
            await session.save();
            return res.json(session);
        }

        return res.status(404).json({ message: 'Route not found' });
    } catch (err) {
        console.error('Sessions API error:', err);
        res.status(500).json({ message: `Sessions API error: ${err.message}` });
    }
};
