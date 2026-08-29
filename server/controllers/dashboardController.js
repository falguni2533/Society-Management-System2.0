const User = require('../models/User');
const Flat = require('../models/Flat');
const Complaint = require('../models/Complaint');
const Notice = require('../models/Notice');
const Bill = require('../models/Bill');
const Visitor = require('../models/Visitor');

// @desc    Get Resident Dashboard data
// @route   GET /api/dashboard/resident
// @access  Private (Resident, Admin)
const getResidentDashboard = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const user = (await User.findById(userId).populate('flat')) || req.user;

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const [
      activeComplaints,
      resolvedComplaints,
      totalNotices,
      pendingBillsCount,
      residentBills,
      expectedVisitorsToday,
    ] = await Promise.all([
      Complaint.countDocuments({ resident: userId, status: { $ne: 'Resolved' } }),
      Complaint.countDocuments({ resident: userId, status: 'Resolved' }),
      Notice.countDocuments(),
      Bill.countDocuments({
        resident: userId,
        status: { $in: ['Pending', 'Overdue'] },
      }),
      Bill.find({
        resident: userId,
        status: { $in: ['Pending', 'Overdue'] },
      }),
      Visitor.countDocuments({
        resident: userId,
        expectedDate: { $gte: startOfToday, $lte: endOfToday },
        status: 'Pre-Approved',
      }),
    ]);

    const totalPendingAmount = residentBills.reduce((sum, b) => sum + (b.amount || 0), 0);

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
          pendingBills: pendingBillsCount,
          totalPendingAmount,
          expectedVisitorsToday,
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
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

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
      totalBills,
      allBills,
      totalVisitors,
      expectedVisitorsToday,
      activeVisitorsInside,
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
      Bill.countDocuments(),
      Bill.find({}),
      Visitor.countDocuments(),
      Visitor.countDocuments({
        expectedDate: { $gte: startOfToday, $lte: endOfToday },
        status: 'Pre-Approved',
      }),
      Visitor.countDocuments({ status: 'Checked In' }),
    ]);

    const pendingBills = allBills.filter((b) => b.status === 'Pending' || b.status === 'Overdue');
    const paidBills = allBills.filter((b) => b.status === 'Paid');

    const totalPendingDues = pendingBills.reduce((sum, b) => sum + (b.amount || 0), 0);
    const totalCollectedDues = paidBills.reduce((sum, b) => sum + (b.amount || 0), 0);

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
          billing: {
            totalBills,
            pendingBillsCount: pendingBills.length,
            paidBillsCount: paidBills.length,
            totalPendingDues,
            totalCollectedDues,
          },
          pendingDues: totalPendingDues,
          visitors: {
            totalVisitors,
            expectedToday: expectedVisitorsToday,
            currentlyInside: activeVisitorsInside,
          },
          expectedVisitorsToday,
          activeVisitorsInside,
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
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const [
      totalFlats,
      totalResidents,
      totalNotices,
      expectedVisitorsToday,
      currentlyInside,
      completedVisitsToday,
    ] = await Promise.all([
      Flat.countDocuments(),
      User.countDocuments({ role: 'resident' }),
      Notice.countDocuments(),
      Visitor.countDocuments({
        expectedDate: { $gte: startOfToday, $lte: endOfToday },
        status: 'Pre-Approved',
      }),
      Visitor.countDocuments({ status: 'Checked In' }),
      Visitor.countDocuments({
        status: 'Checked Out',
        checkOutTime: { $gte: startOfToday, $lte: endOfToday },
      }),
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
          expectedVisitorsToday,
          currentlyInside,
          completedVisitsToday,
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
