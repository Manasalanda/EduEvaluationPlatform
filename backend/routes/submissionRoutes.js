const express = require('express');
const router = express.Router();
const { createSubmission, getSubmissions, getSubmission } = require('../controllers/submissionController');
const { protect, studentOnly } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.use(protect);

router.route('/')
  .get(getSubmissions)
  .post(studentOnly, upload.single('file'), createSubmission);

router.route('/:id')
  .get(getSubmission);

module.exports = router;