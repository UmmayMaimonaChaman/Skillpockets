const jwt = require('jsonwebtoken');

// Middleware to protect routes in serverless context
function auth(req, res, next) {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ message: `Token invalid: ${err.message}` });
    }
}

// Admin authorization middleware
async function adminOnly(req, res, next) {
    try {
        const User = require('../_models/User');
        const user = await User.findById(req.user.userId);
        if (!user || user.role !== 'admin') {
            return res.status(403).json({ message: 'Admin access required' });
        }
        next();
    } catch (err) {
        res.status(500).json({ message: `Admin check failed: ${err.message}` });
    }
}

// Helper to run middleware in serverless context
function runMiddleware(req, res, fn) {
    return new Promise((resolve, reject) => {
        fn(req, res, (result) => {
            if (result instanceof Error) {
                return reject(result);
            }
            return resolve(result);
        });
    });
}

module.exports = { auth, adminOnly, runMiddleware };
