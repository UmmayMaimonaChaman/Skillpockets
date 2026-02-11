const { connectToDatabase } = require('../_lib/db');
const { auth, runMiddleware } = require('../_lib/middleware');
const Skill = require('../_models/Skill');

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

        const { path } = req.query;
        const pathStr = Array.isArray(path) ? path.join('/') : path || '';

        // Get all skills (public)
        if (!pathStr && req.method === 'GET') {
            const skills = await Skill.find().populate('owner', 'name email');
            return res.json(skills);
        }

        // Create a new skill (requires auth)
        if (!pathStr && req.method === 'POST') {
            await runMiddleware(req, res, auth);
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
            return res.status(201).json(skill);
        }

        // Get my skills (requires auth)
        if (pathStr === 'mine' && req.method === 'GET') {
            await runMiddleware(req, res, auth);
            const skills = await Skill.find({ owner: req.user.userId });
            return res.json(skills);
        }

        // Get skill by ID (public)
        if (pathStr && pathStr !== 'mine' && req.method === 'GET') {
            const skill = await Skill.findById(pathStr).populate('owner', 'name email');
            if (!skill) {
                return res.status(404).json({ message: 'Skill not found' });
            }
            return res.json(skill);
        }

        // Update skill (requires auth and ownership)
        if (pathStr && req.method === 'PUT') {
            await runMiddleware(req, res, auth);
            const skill = await Skill.findById(pathStr);
            if (!skill) {
                return res.status(404).json({ message: 'Skill not found' });
            }
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
            return res.json(skill);
        }

        // Delete skill (requires auth and ownership)
        if (pathStr && req.method === 'DELETE') {
            await runMiddleware(req, res, auth);
            const skill = await Skill.findById(pathStr);
            if (!skill) {
                return res.status(404).json({ message: 'Skill not found' });
            }
            if (req.user.role !== 'admin' && skill.owner.toString() !== req.user.userId) {
                return res.status(403).json({ message: 'Not authorized' });
            }
            await skill.deleteOne();
            return res.json({ message: 'Skill deleted' });
        }

        return res.status(404).json({ message: 'Route not found' });
    } catch (err) {
        console.error('Skills API error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};
