const SkillRequest = require('../models/SkillRequest');
const Skill = require('../models/Skill');
const User = require('../models/User');
const Session = require('../models/Session');
const nodemailer = require('nodemailer');

// Email notification helper
const sendEmail = async (to, subject, text) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject,
    text,
  });
};

// Create a new skill request
exports.createSkillRequest = async (req, res) => {
  try {
    const { skill: skillId, message, preferredSchedule } = req.body;
    const skill = await Skill.findById(skillId).populate('owner');
    if (!skill) return res.status(404).json({ message: 'Skill not found' });
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
    // Email notification to owner
    await sendEmail(
      skill.owner.email,
      'New Skill Exchange Request',
      `You have received a new request for your skill: ${skill.title}\n\nMessage: ${message}\nPreferred Schedule: ${preferredSchedule}`
    );
    res.status(201).json(newRequest);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get requests where user is the skill owner (received requests)
exports.getReceivedRequests = async (req, res) => {
  try {
    const requests = await SkillRequest.find({ owner: req.user.userId })
      .populate('skill')
      .populate('requester', 'name email');
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get requests where user is the requester (sent requests)
exports.getSentRequests = async (req, res) => {
  try {
    const requests = await SkillRequest.find({ requester: req.user.userId })
      .populate('skill')
      .populate('owner', 'name email');
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Update request status (accept/reject/cancel)
exports.updateRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const validStatuses = ['accepted', 'rejected', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    const request = await SkillRequest.findById(id).populate('owner requester skill');
    if (!request) return res.status(404).json({ message: 'Request not found' });
    // Only owner can accept/reject, requester can cancel
    if (
      (status === 'accepted' || status === 'rejected') && request.owner._id.toString() !== req.user.userId
    ) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    if (status === 'cancelled' && request.requester._id.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    request.status = status;
    await request.save();

    // If request is accepted, create a session
    if (status === 'accepted') {
      // Parse preferred schedule to create a date
      let scheduledTime = new Date();
      if (request.preferredSchedule) {
        // Try to parse the preferred schedule
        const scheduleText = request.preferredSchedule.toLowerCase();
        if (scheduleText.includes('monday')) scheduledTime.setDate(scheduledTime.getDate() + (1 + 7 - scheduledTime.getDay()) % 7);
        else if (scheduleText.includes('tuesday')) scheduledTime.setDate(scheduledTime.getDate() + (2 + 7 - scheduledTime.getDay()) % 7);
        else if (scheduleText.includes('wednesday')) scheduledTime.setDate(scheduledTime.getDate() + (3 + 7 - scheduledTime.getDay()) % 7);
        else if (scheduleText.includes('thursday')) scheduledTime.setDate(scheduledTime.getDate() + (4 + 7 - scheduledTime.getDay()) % 7);
        else if (scheduleText.includes('friday')) scheduledTime.setDate(scheduledTime.getDate() + (5 + 7 - scheduledTime.getDay()) % 7);
        else if (scheduleText.includes('saturday')) scheduledTime.setDate(scheduledTime.getDate() + (6 + 7 - scheduledTime.getDay()) % 7);
        else if (scheduleText.includes('sunday')) scheduledTime.setDate(scheduledTime.getDate() + (7 + 7 - scheduledTime.getDay()) % 7);
        
        // Set time to 2 PM by default
        scheduledTime.setHours(14, 0, 0, 0);
      }

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

    // Email notification to both parties
    await sendEmail(
      request.requester.email,
      'Skill Exchange Request Update',
      `Your request for skill: ${request.skill.title} has been ${status}.`
    );
    await sendEmail(
      request.owner.email,
      'Skill Exchange Request Update',
      `A request for your skill: ${request.skill.title} has been ${status}.`
    );
    res.json(request);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
}; 