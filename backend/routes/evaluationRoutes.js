const express = require('express');
const router = express.Router();
const { evaluateSubmission, getEvaluation } = require('../controllers/evaluationController');
const { protect, instructorOnly } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/:submissionId', instructorOnly, evaluateSubmission);
router.get('/:submissionId', getEvaluation);

module.exports = router;