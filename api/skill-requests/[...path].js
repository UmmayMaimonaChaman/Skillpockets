const { connectToDatabase } = require('../_lib/db');
const { auth, runMiddleware } = require('../_lib/middleware');
const SkillRequest = require('../_models/SkillRequest');
const Skill = require('../_models/Skill');
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

        // Create a new skill request
        if (!pathStr && req.method === 'POST') {
            const { skill: skillId, message, preferredSchedule } = req.body;
            const skill = await Skill.findById(skillId).populate('owner');
            if (!skill) {
                return res.status(404).json({ message: 'Skill not found' });
            }
            if (skill.owner._id.toString() === req.user.userId) {
                return res.status(400).json({ message: 'You cannot request your own skill' });
            }
            const newRequest = new SkillRequest({
                skill: skillId,
                requester: req.user.userId,
                owner: skill.owner._id,
                message,
                preferredSchedule,
            });
            await newRequest.save();
            return res.status(201).json(newRequest);
        }

        // Get received requests
        if (pathStr === 'received' && req.method === 'GET') {
            const requests = await SkillRequest.find({ owner: req.user.userId })
                .populate('skill')
                .populate('requester', 'name email');
            return res.json(requests);
        }

        // Get sent requests
        if (pathStr === 'sent' && req.method === 'GET') {
            const requests = await SkillRequest.find({ requester: req.user.userId })
                .populate('skill')
                .populate('owner', 'name email');
            return res.json(requests);
        }

        // Update request status
        if (pathStr.includes('/status') && req.method === 'PUT') {
            const id = pathStr.split('/')[0];
            const { status } = req.body;
            const validStatuses = ['accepted', 'rejected', 'cancelled'];
            if (!validStatuses.includes(status)) {
                return res.status(400).json({ message: 'Invalid status' });
            }
            const request = await SkillRequest.findById(id).populate('owner requester skill');
            if (!request) {
                return res.status(404).json({ message: 'Request not found' });
            }
            // Only owner can accept/reject, requester can cancel
            if ((status === 'accepted' || status === 'rejected') && request.owner._id.toString() !== req.user.userId) {
                return res.status(403).json({ message: 'Not authorized' });
            }
            if (status === 'cancelled' && request.requester._id.toString() !== req.user.userId) {
                return res.status(403).json({ message: 'Not authorized' });
            }
            request.status = status;
            await request.save();

            // If request is accepted, create a session
            if (status === 'accepted') {
                let scheduledTime = new Date();
                scheduledTime.setHours(14, 0, 0, 0);
                const newSession = new Session({
                    skill: request.skill._id,
                    requester: request.requester._id,
                    owner: request.owner._id,
                    scheduledTime: scheduledTime,
                    status: 'scheduled',
                    request: request._id,
                });
                await newSession.save();
            }

            return res.json(request);
        }

        return res.status(404).json({ message: 'Route not found' });
    } catch (err) {
        console.error('Skill requests API error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};
