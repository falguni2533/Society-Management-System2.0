const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  getFlatsForRegistration,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/flats', getFlatsForRegistration);
router.get('/me', protect, getMe);

module.exports = router;
