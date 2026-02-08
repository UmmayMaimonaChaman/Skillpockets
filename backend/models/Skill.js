const mongoose = require('mongoose');

const SkillSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['offer', 'request'],
    required: true,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  availability: [
    {
      type: String, // e.g., 'Monday 10am-12pm'
    }
  ],
  isApproved: {
    type: Boolean,
    default: false,
  },
  isRemoved: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Skill', SkillSchema); 