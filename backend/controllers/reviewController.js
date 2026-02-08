const Review = require('../models/Review');
const Session = require('../models/Session');

// Create a new review
exports.createReview = async (req, res) => {
  try {
    const { reviewee, session, rating, comment } = req.body;
    const reviewer = req.user.userId;
    
    // Check if session is completed and user participated
    const sessionDoc = await Session.findById(session);
    if (!sessionDoc) {
      return res.status(404).json({ message: 'Session not found' });
    }
    
    if (sessionDoc.status !== 'completed') {
      return res.status(400).json({ message: 'Can only review after session is completed' });
    }
    
    if (
      sessionDoc.owner.toString() !== reviewer &&
      sessionDoc.requester.toString() !== reviewer
    ) {
      return res.status(403).json({ message: 'Not authorized to review this session' });
    }
    
    // Only one review per session per user
    const existing = await Review.findOne({ reviewer, session });
    if (existing) {
      return res.status(400).json({ message: 'You have already reviewed this session' });
    }
    
    const newReview = new Review({ reviewer, reviewee, session, rating, comment });
    await newReview.save();
    
    // Populate the review before sending response
    await newReview.populate([
      { path: 'reviewer', select: 'name email' },
      { path: 'reviewee', select: 'name email' },
      { path: 'session', populate: { path: 'skill', select: 'title' } }
    ]);
    
    res.status(201).json(newReview);
  } catch (err) {
    console.error('Review creation error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all reviews for a user (received)
exports.getReviewsForUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const reviews = await Review.find({ reviewee: userId })
      .populate('reviewer', 'name email')
      .populate('session', 'scheduledTime status')
      .populate('session.skill', 'title')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all reviews written by the logged-in user
exports.getMyReviews = async (req, res) => {
  try {
    const reviewer = req.user.userId;
    const reviews = await Review.find({ reviewer })
      .populate('reviewee', 'name email')
      .populate('session', 'scheduledTime status')
      .populate('session.skill', 'title')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
}; 