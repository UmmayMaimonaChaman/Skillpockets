const Session = require('../models/Session');
const Skill = require('../models/Skill');
const SkillRequest = require('../models/SkillRequest');

// Create a new session (after request is accepted)
exports.createSession = async (req, res) => {
  try {
    const { skill, requester, owner, scheduledTime, request, comment } = req.body;
    
    // Validate required fields
    if (!skill || !requester || !owner || !scheduledTime || !request) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    // Check if session already exists for this request
    const existing = await Session.findOne({ request });
    if (existing) {
      return res.status(400).json({ message: 'Session already exists for this request' });
    }
    
    // Verify that the user creating the session is the skill owner
    const skillDoc = await Skill.findById(skill);
    if (!skillDoc) {
      return res.status(404).json({ message: 'Skill not found' });
    }
    
    if (skillDoc.owner.toString() !== owner) {
      return res.status(403).json({ message: 'Only skill owner can create sessions' });
    }
    
    // Verify that the request is accepted
    const requestDoc = await SkillRequest.findById(request);
    if (!requestDoc) {
      return res.status(404).json({ message: 'Request not found' });
    }
    
    if (requestDoc.status !== 'accepted') {
      return res.status(400).json({ message: 'Can only create sessions for accepted requests' });
    }
    
    const session = new Session({
      skill,
      requester,
      owner,
      scheduledTime,
      request,
      comment: comment || '',
    });
    
    await session.save();
    
    // Populate the session with user and skill details
    await session.populate([
      { path: 'skill', select: 'title description' },
      { path: 'requester', select: 'name email' },
      { path: 'owner', select: 'name email' },
      { path: 'request' }
    ]);
    
    res.status(201).json(session);
  } catch (err) {
    console.error('Session creation error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all sessions for the logged-in user (as owner or requester)
exports.getUserSessions = async (req, res) => {
  try {
    const userId = req.user.userId;
    const sessions = await Session.find({
      $or: [{ owner: userId }, { requester: userId }],
    })
      .populate('skill')
      .populate('requester', 'name email')
      .populate('owner', 'name email')
      .populate('request')
      .sort({ createdAt: -1 });
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Update a session (reschedule/cancel/complete/add meet link)
exports.updateSession = async (req, res) => {
  try {
    const { id } = req.params;
    const { scheduledTime, status, meetLink, comment } = req.body;
    const session = await Session.findById(id);
    
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }
    
    // Only owner or requester can update
    if (
      session.owner.toString() !== req.user.userId &&
      session.requester.toString() !== req.user.userId
    ) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    if (scheduledTime) session.scheduledTime = scheduledTime;
    if (status) session.status = status;
    if (meetLink !== undefined) session.meetLink = meetLink;
    if (comment !== undefined) session.comment = comment;
    
    await session.save();
    
    // Populate the session before sending response
    await session.populate([
      { path: 'skill', select: 'title description' },
      { path: 'requester', select: 'name email' },
      { path: 'owner', select: 'name email' },
      { path: 'request' }
    ]);
    
    res.json(session);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
}; 