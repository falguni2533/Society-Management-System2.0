const express = require('express');
const router = express.Router();
const {
  createBill,
  getMyBills,
  getAllBills,
  getBillById,
  updateBillStatus,
  deleteBill,
} = require('../controllers/billController');
const { protect, authorize } = require('../middleware/auth');

// All bill routes require authentication
router.use(protect);

// Security staff is strictly forbidden from all billing and financial endpoints
router.use((req, res, next) => {
  if (req.user && req.user.role === 'security') {
    return res.status(403).json({
      success: false,
      message: 'Security personnel are not authorized to access billing or financial records',
    });
  }
  next();
});

// Resident views their own bills
router.get('/my', authorize('resident'), getMyBills);

// Admin views all society bills
router.get('/', authorize('admin'), getAllBills);

// Admin creates a new bill
router.post('/', authorize('admin'), createBill);

// View single bill (Resident can view own, Admin can view any)
router.get('/:id', authorize('resident', 'admin'), getBillById);

// Admin updates status / marks as Paid
router.patch('/:id/status', authorize('admin'), updateBillStatus);
router.patch('/:id/pay', authorize('admin'), updateBillStatus);

// Admin deletes bill
router.delete('/:id', authorize('admin'), deleteBill);

module.exports = router;
