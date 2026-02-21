
const asyncHandler = require('express-async-handler');
const axios = require('axios');
const Submission = require('../models/Submission');

// @desc    Trigger AI evaluation
// @route   POST /api/evaluate/:submissionId
const evaluateSubmission = asyncHandler(async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.submissionId)
      .populate('assignment', 'title description keywords maxScore');

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }

    if (submission.status === 'evaluated') {
      return res.json({
        success: true,
        data: submission
      });
    }

    // Get all other submissions for plagiarism check
    const allSubmissions = await Submission.find({
      assignment: submission.assignment._id,
      _id: { $ne: submission._id },
      textContent: { $ne: '' }
    }).select('textContent');

    const corpus = allSubmissions.map(s => s.textContent);

    // Mark as evaluating
    submission.status = 'evaluating';
    await submission.save();

    try {
      const mlResponse = await axios.post(
        `${process.env.ML_API_URL}/evaluate`,
        {
          submission_id: submission._id.toString(),
          text: submission.textContent,
          corpus,
          keywords: submission.assignment.keywords || [],
          max_score: submission.assignment.maxScore || 100
        },
        { timeout: 30000 }
      );

      const {
        plagiarism_risk_numeric,
        score,
        feedback_summary,
        details
      } = mlResponse.data;

      submission.status = 'evaluated';
      submission.evaluation = {
        plagiarismRisk: plagiarism_risk_numeric || 0,
        score: score || 0,
        feedbackSummary: feedback_summary || '',
        details: details || {},
        evaluatedAt: new Date()
      };

      await submission.save();

      return res.json({
        success: true,
        data: submission
      });

    } catch (mlError) {
      console.error('ML Error:', mlError.message);
      submission.status = 'failed';
      await submission.save();

      return res.status(500).json({
        success: false,
        message: `ML evaluation failed: ${mlError.message}`
      });
    }

  } catch (error) {
    console.error('Evaluation error:', error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Get evaluation result
// @route   GET /api/evaluate/:submissionId
const getEvaluation = asyncHandler(async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.submissionId)
      .populate('assignment', 'title subject');

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }

    return res.json({
      success: true,
      data: {
        submission_id: submission._id,
        status: submission.status,
        evaluation: submission.evaluation
      }
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = { evaluateSubmission, getEvaluation };