const express = require('express');
const router = express.Router();
const {
  createVisitor,
  getMyVisitors,
  getTodayVisitors,
  getAllVisitors,
  getVisitorById,
  checkInVisitor,
  checkOutVisitor,
  cancelVisitor,
  verifyPassCode,
} = require('../controllers/visitorController');
const { protect, authorize } = require('../middleware/auth');

// All visitor routes require authentication
router.use(protect);

// Resident pre-approves visitor (or Admin)
router.post('/', authorize('resident', 'admin'), createVisitor);

// Resident views their own visitor history
router.get('/my', authorize('resident'), getMyVisitors);

// Security and Admin view today's expected & active visitors
router.get('/today', authorize('security', 'admin'), getTodayVisitors);

// Security and Admin lookup visitor by pass code
router.get('/verify/:passCode', authorize('security', 'admin'), verifyPassCode);

// Security and Admin view all society visitor logs
router.get('/', authorize('security', 'admin'), getAllVisitors);

// Single visitor details (Resident for own, Security, Admin)
router.get('/:id', authorize('resident', 'security', 'admin'), getVisitorById);

// Security and Admin perform Check-In
router.patch('/:id/checkin', authorize('security', 'admin'), checkInVisitor);

// Security and Admin perform Check-Out
router.patch('/:id/checkout', authorize('security', 'admin'), checkOutVisitor);

// Resident cancels own pre-approved pass (or Admin)
router.patch('/:id/cancel', authorize('resident', 'admin'), cancelVisitor);

module.exports = router;
