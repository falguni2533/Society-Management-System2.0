const Visitor = require('../models/Visitor');
const Flat = require('../models/Flat');
const User = require('../models/User');

// Helper to generate a unique readable pass code (e.g. VIS-4821)
const generatePassCode = async () => {
  let isUnique = false;
  let code = '';
  while (!isUnique) {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    code = `VIS-${randomNum}`;
    const existing = await Visitor.findOne({ passCode: code });
    if (!existing) {
      isUnique = true;
    }
  }
  return code;
};

// @desc    Pre-approve / Register a visitor
// @route   POST /api/visitors
// @access  Private (Resident, Admin)
const createVisitor = async (req, res, next) => {
  try {
    const {
      visitorName,
      phone,
      purpose,
      flat: flatId,
      expectedDate,
      expectedTime,
      vehicleNumber,
      notes,
    } = req.body;

    if (!visitorName || !phone || !expectedDate) {
      return res.status(400).json({
        success: false,
        message: 'Please provide visitorName, phone, and expectedDate',
      });
    }

    let targetFlatId = flatId;
    let targetResidentId = req.user._id;

    if (req.user.role === 'resident') {
      if (!req.user.flat) {
        return res.status(400).json({
          success: false,
          message: 'No flat assigned to your resident account. Please contact admin.',
        });
      }
      targetFlatId = req.user.flat._id || req.user.flat;
      targetResidentId = req.user._id;
    } else {
      // Admin creating on behalf of resident/flat
      if (!targetFlatId) {
        return res.status(400).json({
          success: false,
          message: 'Please specify the target flat ID for this visitor',
        });
      }
      const flat = await Flat.findById(targetFlatId);
      if (!flat) {
        return res.status(404).json({
          success: false,
          message: 'Flat not found',
        });
      }
      if (flat.owner) {
        targetResidentId = flat.owner;
      } else if (flat.residents && flat.residents.length > 0) {
        targetResidentId = flat.residents[0];
      }
    }

    const passCode = await generatePassCode();

    const validPurposes = [
      'Guest / Family',
      'Delivery',
      'Home Service / Repair',
      'Cab / Taxi',
      'Official / Business',
      'Maintenance',
      'Other',
    ];
    const resolvedPurpose =
      purpose && validPurposes.includes(purpose) ? purpose : 'Guest / Family';

    const visitor = await Visitor.create({
      visitorName: visitorName.trim(),
      phone: phone.trim(),
      purpose: resolvedPurpose,
      flat: targetFlatId,
      resident: targetResidentId,
      expectedDate: new Date(expectedDate),
      expectedTime: expectedTime ? expectedTime.trim() : '',
      vehicleNumber: vehicleNumber ? vehicleNumber.trim().toUpperCase() : '',
      notes: notes ? notes.trim() : '',
      passCode,
      status: 'Pre-Approved',
    });

    const populatedVisitor = await Visitor.findById(visitor._id)
      .populate('flat', 'wing flatNumber floor type')
      .populate('resident', 'name email phone');

    res.status(201).json({
      success: true,
      message: 'Visitor pre-approved successfully',
      data: populatedVisitor,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get visitor history for the logged-in resident
// @route   GET /api/visitors/my
// @access  Private (Resident)
const getMyVisitors = async (req, res, next) => {
  try {
    const { status, search } = req.query;
    const filter = { resident: req.user._id };

    if (status && ['Pre-Approved', 'Checked In', 'Checked Out', 'Cancelled'].includes(status)) {
      filter.status = status;
    }

    if (search) {
      filter.$or = [
        { visitorName: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { passCode: { $regex: search, $options: 'i' } },
      ];
    }

    const visitors = await Visitor.find(filter)
      .populate('flat', 'wing flatNumber floor type')
      .populate('securityGuard', 'name phone')
      .sort({ expectedDate: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: visitors.length,
      data: visitors,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get today's expected & active visitors (Security / Admin gate desk)
// @route   GET /api/visitors/today
// @access  Private (Security, Admin)
const getTodayVisitors = async (req, res, next) => {
  try {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    // Fetch visitors expected today OR currently checked in
    const visitors = await Visitor.find({
      $or: [
        {
          expectedDate: { $gte: startOfToday, $lte: endOfToday },
        },
        {
          status: 'Checked In',
        },
        {
          checkInTime: { $gte: startOfToday, $lte: endOfToday },
        },
      ],
    })
      .populate('flat', 'wing flatNumber floor type')
      .populate('resident', 'name email phone')
      .populate('securityGuard', 'name phone')
      .sort({ status: 1, expectedDate: 1, createdAt: -1 });

    const expectedCount = visitors.filter((v) => v.status === 'Pre-Approved').length;
    const checkedInCount = visitors.filter((v) => v.status === 'Checked In').length;
    const checkedOutTodayCount = visitors.filter((v) => v.status === 'Checked Out').length;

    res.status(200).json({
      success: true,
      count: visitors.length,
      stats: {
        expectedToday: expectedCount,
        currentlyInside: checkedInCount,
        completedToday: checkedOutTodayCount,
      },
      data: visitors,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all visitor records across society (Admin, Security)
// @route   GET /api/visitors
// @access  Private (Admin, Security)
const getAllVisitors = async (req, res, next) => {
  try {
    const { status, date, wing, search } = req.query;
    const filter = {};

    if (status && ['Pre-Approved', 'Checked In', 'Checked Out', 'Cancelled'].includes(status)) {
      filter.status = status;
    }

    if (date) {
      const selectedDate = new Date(date);
      const startOfDay = new Date(selectedDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(selectedDate);
      endOfDay.setHours(23, 59, 59, 999);
      filter.expectedDate = { $gte: startOfDay, $lte: endOfDay };
    }

    if (search) {
      filter.$or = [
        { visitorName: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { passCode: { $regex: search, $options: 'i' } },
        { vehicleNumber: { $regex: search, $options: 'i' } },
      ];
    }

    const visitors = await Visitor.find(filter)
      .populate('flat', 'wing flatNumber floor type')
      .populate('resident', 'name email phone')
      .populate('securityGuard', 'name phone')
      .sort({ expectedDate: -1, createdAt: -1 });

    // Optional client wing filter if populated
    let filteredVisitors = visitors;
    if (wing) {
      filteredVisitors = visitors.filter(
        (v) => v.flat && v.flat.wing.toUpperCase() === wing.toUpperCase()
      );
    }

    res.status(200).json({
      success: true,
      count: filteredVisitors.length,
      data: filteredVisitors,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single visitor details
// @route   GET /api/visitors/:id
// @access  Private (Resident for own, Security, Admin)
const getVisitorById = async (req, res, next) => {
  try {
    const visitor = await Visitor.findById(req.params.id)
      .populate('flat', 'wing flatNumber floor type')
      .populate('resident', 'name email phone')
      .populate('securityGuard', 'name phone');

    if (!visitor) {
      return res.status(404).json({
        success: false,
        message: 'Visitor record not found',
      });
    }

    // Role check: Resident can only view their own visitor
    if (req.user.role === 'resident' && !visitor.resident._id.equals(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view this visitor record',
      });
    }

    res.status(200).json({
      success: true,
      data: visitor,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Security Check In visitor
// @route   PATCH /api/visitors/:id/checkin
// @access  Private (Security, Admin)
const checkInVisitor = async (req, res, next) => {
  try {
    const visitor = await Visitor.findById(req.params.id);
    if (!visitor) {
      return res.status(404).json({
        success: false,
        message: 'Visitor not found',
      });
    }

    if (visitor.status === 'Checked In') {
      return res.status(400).json({
        success: false,
        message: 'Visitor is already checked in',
      });
    }

    if (visitor.status === 'Cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Cannot check in a cancelled visitor pass',
      });
    }

    visitor.status = 'Checked In';
    visitor.checkInTime = new Date();
    visitor.securityGuard = req.user._id;

    await visitor.save();

    const updatedVisitor = await Visitor.findById(visitor._id)
      .populate('flat', 'wing flatNumber floor type')
      .populate('resident', 'name email phone')
      .populate('securityGuard', 'name phone');

    res.status(200).json({
      success: true,
      message: `Visitor ${visitor.visitorName} checked in successfully at gate`,
      data: updatedVisitor,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Security Check Out visitor
// @route   PATCH /api/visitors/:id/checkout
// @access  Private (Security, Admin)
const checkOutVisitor = async (req, res, next) => {
  try {
    const visitor = await Visitor.findById(req.params.id);
    if (!visitor) {
      return res.status(404).json({
        success: false,
        message: 'Visitor not found',
      });
    }

    if (visitor.status === 'Checked Out') {
      return res.status(400).json({
        success: false,
        message: 'Visitor is already checked out',
      });
    }

    visitor.status = 'Checked Out';
    visitor.checkOutTime = new Date();

    await visitor.save();

    const updatedVisitor = await Visitor.findById(visitor._id)
      .populate('flat', 'wing flatNumber floor type')
      .populate('resident', 'name email phone')
      .populate('securityGuard', 'name phone');

    res.status(200).json({
      success: true,
      message: `Visitor ${visitor.visitorName} checked out successfully`,
      data: updatedVisitor,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel a pre-approved visitor (Resident for own, Admin)
// @route   PATCH /api/visitors/:id/cancel
// @access  Private (Resident, Admin)
const cancelVisitor = async (req, res, next) => {
  try {
    const visitor = await Visitor.findById(req.params.id);
    if (!visitor) {
      return res.status(404).json({
        success: false,
        message: 'Visitor not found',
      });
    }

    // Role check: Resident can only cancel their own pre-approval
    if (req.user.role === 'resident' && !visitor.resident.equals(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to cancel this visitor pass',
      });
    }

    if (visitor.status === 'Checked In' || visitor.status === 'Checked Out') {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel a visitor that has already ${visitor.status.toLowerCase()}`,
      });
    }

    visitor.status = 'Cancelled';
    await visitor.save();

    res.status(200).json({
      success: true,
      message: 'Visitor pre-approval cancelled successfully',
      data: visitor,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify visitor pass code (Security Gate Desk)
// @route   GET /api/visitors/verify/:passCode
// @access  Private (Security, Admin)
const verifyPassCode = async (req, res, next) => {
  try {
    const { passCode } = req.params;
    const cleanCode = passCode.trim().toUpperCase();

    const visitor = await Visitor.findOne({ passCode: cleanCode })
      .populate('flat', 'wing flatNumber floor type')
      .populate('resident', 'name email phone')
      .populate('securityGuard', 'name phone');

    if (!visitor) {
      return res.status(404).json({
        success: false,
        message: `No visitor pass found with code: ${cleanCode}`,
      });
    }

    res.status(200).json({
      success: true,
      data: visitor,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createVisitor,
  getMyVisitors,
  getTodayVisitors,
  getAllVisitors,
  getVisitorById,
  checkInVisitor,
  checkOutVisitor,
  cancelVisitor,
  verifyPassCode,
};
