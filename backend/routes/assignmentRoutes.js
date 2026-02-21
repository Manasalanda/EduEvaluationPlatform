const express = require('express');
const router = express.Router();
const {
  getAssignments, getAssignment, createAssignment,
  updateAssignment, deleteAssignment
} = require('../controllers/assignmentController');
const { protect, instructorOnly } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
  .get(getAssignments)
  .post(instructorOnly, createAssignment);

router.route('/:id')
  .get(getAssignment)
  .put(instructorOnly, updateAssignment)
  .delete(instructorOnly, deleteAssignment);

module.exports = router;