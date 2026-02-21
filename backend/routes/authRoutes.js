const express = require('express');
const router = express.Router();
const { register, login, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Test route to verify auth routes work
router.get('/test', (req, res) => {
  res.json({ success: true, message: 'Auth routes working' });
});

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);

module.exports = router;