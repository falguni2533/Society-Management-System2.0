const express = require('express');
const router = express.Router();
const {
  createComplaint,
  getMyComplaints,
  getAllComplaints,
  getComplaintById,
  updateComplaintStatus,
} = require('../controllers/complaintController');
const { protect, authorize } = require('../middleware/auth');

// All complaint routes require JWT protection
router.use(protect);

// Resident creates complaint
router.post('/', authorize('resident'), createComplaint);

// Resident views their own complaints
router.get('/my', authorize('resident'), getMyComplaints);

// Admin views all society complaints
router.get('/', authorize('admin'), getAllComplaints);

// Single complaint details (Resident can view own, Admin can view any)
router.get('/:id', authorize('resident', 'admin'), getComplaintById);

// Admin updates status and resolution note
router.patch('/:id/status', authorize('admin'), updateComplaintStatus);

module.exports = router;
