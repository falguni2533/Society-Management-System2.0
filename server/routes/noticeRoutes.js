const express = require('express');
const router = express.Router();
const {
  getNotices,
  getNoticeById,
  createNotice,
  deleteNotice,
} = require('../controllers/noticeController');
const { protect, authorize } = require('../middleware/auth');

// All notice routes require authentication
router.use(protect);

// View notices (Resident, Admin, Security)
router.get('/', getNotices);
router.get('/:id', getNoticeById);

// Admin only: create & delete notices
router.post('/', authorize('admin'), createNotice);
router.delete('/:id', authorize('admin'), deleteNotice);

module.exports = router;
