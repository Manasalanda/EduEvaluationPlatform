const asyncHandler = require('express-async-handler');
const path = require('path');
const fs = require('fs');
const Submission = require('../models/Submission');
const Assignment = require('../models/Assignment');

// @desc    Submit assignment
// @route   POST /api/submissions
const createSubmission = asyncHandler(async (req, res) => {
  const { assignmentId, textContent } = req.body;

  if (!assignmentId) {
    res.status(400);
    throw new Error('Assignment ID is required');
  }

  const assignment = await Assignment.findById(assignmentId);
  if (!assignment) {
    res.status(404);
    throw new Error('Assignment not found');
  }

  const existingSubmission = await Submission.findOne({
    assignment: assignmentId,
    student: req.user._id
  });

  if (existingSubmission) {
    res.status(400);
    throw new Error('You have already submitted this assignment');
  }

  const submissionData = {
    assignment: assignmentId,
    student: req.user._id,
    textContent: textContent || '',
    status: 'pending'
  };

  if (req.file) {
    submissionData.fileUrl = `/uploads/${req.file.filename}`;
    submissionData.fileName = req.file.originalname;
  }

  const submission = await Submission.create(submissionData);

  res.status(201).json({ success: true, data: submission });
});

// @desc    Get all submissions (instructor sees all, student sees own)
// @route   GET /api/submissions
const getSubmissions = asyncHandler(async (req, res) => {
  const filter = req.user.role === 'student' ? { student: req.user._id } : {};
  const { assignmentId } = req.query;
  if (assignmentId) filter.assignment = assignmentId;

  const submissions = await Submission.find(filter)
    .populate('student', 'name email')
    .populate('assignment', 'title subject')
    .sort({ createdAt: -1 });

  res.json({ success: true, count: submissions.length, data: submissions });
});

// @desc    Get single submission
// @route   GET /api/submissions/:id
const getSubmission = asyncHandler(async (req, res) => {
  const submission = await Submission.findById(req.params.id)
    .populate('student', 'name email')
    .populate('assignment', 'title subject description keywords maxScore');

  if (!submission) {
    res.status(404);
    throw new Error('Submission not found');
  }

  // Students can only see their own
  if (req.user.role === 'student' && submission.student._id.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Access denied');
  }

  res.json({ success: true, data: submission });
});

module.exports = { createSubmission, getSubmissions, getSubmission };