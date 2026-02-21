const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  assignment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assignment',
    required: true
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  textContent: {
    type: String,
    default: ''
  },
  fileUrl: {
    type: String,
    default: ''
  },
  fileName: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['pending', 'evaluating', 'evaluated', 'failed'],
    default: 'pending'
  },
  evaluation: {
    plagiarismRisk: { type: Number, default: null },
    score: { type: Number, default: null },
    feedbackSummary: { type: String, default: '' },
    details: { type: mongoose.Schema.Types.Mixed, default: {} },
    evaluatedAt: { type: Date }
  },
  submittedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Prevent duplicate submissions
submissionSchema.index({ assignment: 1, student: 1 }, { unique: true });

module.exports = mongoose.model('Submission', submissionSchema);