const { connectToDatabase } = require('../_lib/db');
const { auth, runMiddleware } = require('../_lib/middleware');
const Review = require('../_models/Review');

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

        // Create a new review (requires auth)
        if (!pathStr && req.method === 'POST') {
            await runMiddleware(req, res, auth);
            const { reviewee, session, rating, comment } = req.body;
            const newReview = new Review({
                reviewer: req.user.userId,
                reviewee,
                session,
                rating,
                comment
            });
            await newReview.save();
            return res.status(201).json(newReview);
        }

        // Get reviews for a specific user (public)
        if (pathStr.startsWith('user/') && req.method === 'GET') {
            const userId = pathStr.split('/')[1];
            const reviews = await Review.find({ reviewee: userId })
                .populate('reviewer', 'name')
                .populate('session')
                .sort({ createdAt: -1 });
            return res.json(reviews);
        }

        // Get reviews written by the logged-in user (requires auth)
        if (pathStr === 'mine' && req.method === 'GET') {
            await runMiddleware(req, res, auth);
            const reviews = await Review.find({ reviewer: req.user.userId })
                .populate('reviewee', 'name email')
                .populate('session')
                .sort({ createdAt: -1 });
            return res.json(reviews);
        }

        return res.status(404).json({ message: 'Route not found' });
    } catch (err) {
        console.error('Reviews API error:', err);
        res.status(500).json({ message: `Reviews API error: ${err.message}` });
    }
};
