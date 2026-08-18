const express = require('express');
const router = express.Router();
const {
  getResidentDashboard,
  getAdminDashboard,
  getSecurityDashboard,
} = require('../controllers/dashboardController');
const { protect, authorize } = require('../middleware/auth');

// All dashboard routes require authentication
router.use(protect);

// Resident Dashboard: Accessible by Resident and Admin
router.get('/resident', authorize('resident', 'admin'), getResidentDashboard);

// Admin Dashboard: Accessible only by Admin
router.get('/admin', authorize('admin'), getAdminDashboard);

// Security Dashboard: Accessible by Security and Admin
router.get('/security', authorize('security', 'admin'), getSecurityDashboard);

module.exports = router;
