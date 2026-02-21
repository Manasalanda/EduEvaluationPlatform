const asyncHandler = require('express-async-handler');
const Assignment = require('../models/Assignment');

const getAssignments = asyncHandler(async (req, res) => {
  try {
    const filter = req.user.role === 'instructor'
      ? { instructor: req.user._id }
      : { isActive: true };

    const assignments = await Assignment.find(filter)
      .populate('instructor', 'name email')
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      count: assignments.length,
      data: assignments
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

const getAssignment = asyncHandler(async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id)
      .populate('instructor', 'name email');

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    return res.json({ success: true, data: assignment });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

const createAssignment = asyncHandler(async (req, res) => {
  try {
    const { title, description, subject, maxScore, dueDate, keywords } = req.body;

    if (!title || !description || !subject || !dueDate) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, description, subject and dueDate'
      });
    }

    const assignment = await Assignment.create({
      title,
      description,
      subject,
      maxScore: maxScore || 100,
      dueDate,
      keywords: keywords || [],
      instructor: req.user._id
    });

    return res.status(201).json({ success: true, data: assignment });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

const updateAssignment = asyncHandler(async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    if (assignment.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    const updated = await Assignment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    return res.json({ success: true, data: updated });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

const deleteAssignment = asyncHandler(async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    if (assignment.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    await assignment.deleteOne();
    return res.json({ success: true, message: 'Assignment deleted' });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = {
  getAssignments,
  getAssignment,
  createAssignment,
  updateAssignment,
  deleteAssignment
};