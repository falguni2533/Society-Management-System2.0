const User = require('../models/User');
const Flat = require('../models/Flat');
const Complaint = require('../models/Complaint');
const Notice = require('../models/Notice');

// @desc    Get Resident Dashboard data
// @route   GET /api/dashboard/resident
// @access  Private (Resident, Admin)
const getResidentDashboard = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate('flat');

    const [activeComplaints, resolvedComplaints, totalNotices] = await Promise.all([
      Complaint.countDocuments({ resident: req.user.id, status: { $ne: 'Resolved' } }),
      Complaint.countDocuments({ resident: req.user.id, status: 'Resolved' }),
      Notice.countDocuments(),
    ]);

    res.status(200).json({
      success: true,
      data: {
        resident: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
        },
        flat: user.flat
          ? {
              id: user.flat._id,
              wing: user.flat.wing,
              flatNumber: user.flat.flatNumber,
              floor: user.flat.floor,
              type: user.flat.type,
              status: user.flat.status,
            }
          : null,
        stats: {
          activeComplaints,
          resolvedComplaints,
          totalComplaints: activeComplaints + resolvedComplaints,
          totalNotices,
          pendingBills: 0,
          expectedVisitorsToday: 0,
        },
        message: 'Welcome to your Resident Portal',
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Admin Dashboard data
// @route   GET /api/dashboard/admin
// @access  Private (Admin)
const getAdminDashboard = async (req, res, next) => {
  try {
    const [
      totalResidents,
      totalSecurity,
      totalAdmins,
      totalFlats,
      occupiedFlats,
      vacantFlats,
      totalComplaints,
      openComplaints,
      inProgressComplaints,
      resolvedComplaints,
      totalNotices,
    ] = await Promise.all([
      User.countDocuments({ role: 'resident' }),
      User.countDocuments({ role: 'security' }),
      User.countDocuments({ role: 'admin' }),
      Flat.countDocuments(),
      Flat.countDocuments({ status: 'occupied' }),
      Flat.countDocuments({ status: 'vacant' }),
      Complaint.countDocuments(),
      Complaint.countDocuments({ status: 'Open' }),
      Complaint.countDocuments({ status: 'In Progress' }),
      Complaint.countDocuments({ status: 'Resolved' }),
      Notice.countDocuments(),
    ]);

    res.status(200).json({
      success: true,
      data: {
        counts: {
          residents: totalResidents,
          securityStaff: totalSecurity,
          admins: totalAdmins,
          totalUsers: totalResidents + totalSecurity + totalAdmins,
          flats: {
            total: totalFlats,
            occupied: occupiedFlats,
            vacant: vacantFlats,
          },
        },
        stats: {
          totalComplaints,
          openComplaints,
          inProgressComplaints,
          resolvedComplaints,
          totalNotices,
          pendingDues: 0,
        },
        systemStatus: {
          status: 'Operational',
          database: 'Connected',
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Security Dashboard data
// @route   GET /api/dashboard/security
// @access  Private (Security, Admin)
const getSecurityDashboard = async (req, res, next) => {
  try {
    const [totalFlats, totalResidents, totalNotices] = await Promise.all([
      Flat.countDocuments(),
      User.countDocuments({ role: 'resident' }),
      Notice.countDocuments(),
    ]);

    res.status(200).json({
      success: true,
      data: {
        securityOfficer: {
          id: req.user._id,
          name: req.user.name,
          email: req.user.email,
          phone: req.user.phone,
        },
        gateCheckpoint: 'Main Gate 1',
        shift: 'Active Duty',
        stats: {
          expectedVisitorsToday: 0,
          currentlyInside: 0,
          completedVisitsToday: 0,
          totalNotices,
        },
        societyOverview: {
          totalFlats,
          totalResidents,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getResidentDashboard,
  getAdminDashboard,
  getSecurityDashboard,
};
