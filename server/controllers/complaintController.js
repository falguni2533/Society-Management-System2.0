const Complaint = require('../models/Complaint');

// @desc    Create a new complaint
// @route   POST /api/complaints
// @access  Private (Resident)
const createComplaint = async (req, res, next) => {
  try {
    const { title, description, category, priority } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both title and description for the complaint',
      });
    }

    const validCategories = ['Plumbing', 'Electrical', 'Cleaning', 'Security', 'Other'];
    const validPriorities = ['Low', 'Medium', 'High'];

    const complaintCategory = category && validCategories.includes(category)
      ? category
      : 'Other';

    const complaintPriority = priority && validPriorities.includes(priority)
      ? priority
      : 'Medium';

    const complaint = await Complaint.create({
      resident: req.user._id,
      title: title.trim(),
      description: description.trim(),
      category: complaintCategory,
      priority: complaintPriority,
      status: 'Open',
    });

    const populatedComplaint = await Complaint.findById(complaint._id).populate({
      path: 'resident',
      select: 'name email phone flat',
      populate: {
        path: 'flat',
        select: 'wing flatNumber floor type',
      },
    });

    res.status(201).json({
      success: true,
      message: 'Complaint submitted successfully',
      data: populatedComplaint,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all complaints created by the logged-in resident
// @route   GET /api/complaints/my
// @access  Private (Resident)
const getMyComplaints = async (req, res, next) => {
  try {
    const complaints = await Complaint.find({ resident: req.user._id })
      .populate({
        path: 'resident',
        select: 'name email phone flat',
        populate: {
          path: 'flat',
          select: 'wing flatNumber floor',
        },
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: complaints.length,
      data: complaints,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all complaints across society (Admin view)
// @route   GET /api/complaints
// @access  Private (Admin)
const getAllComplaints = async (req, res, next) => {
  try {
    const { status, category, priority } = req.query;
    const filter = {};

    if (status && ['Open', 'In Progress', 'Resolved'].includes(status)) {
      filter.status = status;
    }
    if (category && ['Plumbing', 'Electrical', 'Cleaning', 'Security', 'Other'].includes(category)) {
      filter.category = category;
    }
    if (priority && ['Low', 'Medium', 'High'].includes(priority)) {
      filter.priority = priority;
    }

    const complaints = await Complaint.find(filter)
      .populate({
        path: 'resident',
        select: 'name email phone flat',
        populate: {
          path: 'flat',
          select: 'wing flatNumber floor type',
        },
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: complaints.length,
      data: complaints,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single complaint by ID
// @route   GET /api/complaints/:id
// @access  Private (Resident, Admin)
const getComplaintById = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id).populate({
      path: 'resident',
      select: 'name email phone flat',
      populate: {
        path: 'flat',
        select: 'wing flatNumber floor type',
      },
    });

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found',
      });
    }

    // Role check: Resident can only view their own complaint
    if (req.user.role === 'resident' && !complaint.resident._id.equals(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view this complaint',
      });
    }

    res.status(200).json({
      success: true,
      data: complaint,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update complaint status & resolution note
// @route   PATCH /api/complaints/:id/status
// @access  Private (Admin)
const updateComplaintStatus = async (req, res, next) => {
  try {
    const { status, resolutionNote } = req.body;

    const validStatuses = ['Open', 'In Progress', 'Resolved'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found',
      });
    }

    if (status) {
      complaint.status = status;
    }
    if (resolutionNote !== undefined) {
      complaint.resolutionNote = resolutionNote.trim();
    }

    await complaint.save();

    const updatedComplaint = await Complaint.findById(complaint._id).populate({
      path: 'resident',
      select: 'name email phone flat',
      populate: {
        path: 'flat',
        select: 'wing flatNumber floor type',
      },
    });

    res.status(200).json({
      success: true,
      message: 'Complaint status updated successfully',
      data: updatedComplaint,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createComplaint,
  getMyComplaints,
  getAllComplaints,
  getComplaintById,
  updateComplaintStatus,
};
