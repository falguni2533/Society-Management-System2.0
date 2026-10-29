const Bill = require('../models/Bill');
const Flat = require('../models/Flat');
const User = require('../models/User');

// @desc    Create a new bill (Admin only)
// @route   POST /api/bills
// @access  Private (Admin)
const createBill = async (req, res, next) => {
  try {
    const {
      flat: flatId,
      resident: residentId,
      amount,
      month,
      year,
      billType,
      dueDate,
      description,
      notes,
    } = req.body;

    if (!flatId || !amount || !month || !year || !dueDate) {
      return res.status(400).json({
        success: false,
        message: 'Please provide flat, amount, month, year, and dueDate',
      });
    }

    if (Number(amount) < 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount cannot be negative',
      });
    }

    const flat = await Flat.findById(flatId);
    if (!flat) {
      return res.status(404).json({
        success: false,
        message: 'Flat not found',
      });
    }

    // Resolve resident: use explicit residentId or flat owner / first resident
    let targetResidentId = residentId;
    if (!targetResidentId) {
      if (flat.owner) {
        targetResidentId = flat.owner;
      } else if (flat.residents && flat.residents.length > 0) {
        targetResidentId = flat.residents[0];
      } else {
        return res.status(400).json({
          success: false,
          message: 'No resident assigned to this flat. Please specify a resident ID.',
        });
      }
    }

    const residentUser = await User.findById(targetResidentId);
    if (!residentUser) {
      return res.status(404).json({
        success: false,
        message: 'Resident user not found',
      });
    }

    const validBillTypes = [
      'Maintenance',
      'Water',
      'Electricity',
      'Parking',
      'Clubhouse',
      'Special Assessment',
      'Other',
    ];
    const resolvedBillType =
      billType && validBillTypes.includes(billType) ? billType : 'Maintenance';

    const bill = await Bill.create({
      flat: flat._id,
      resident: residentUser._id,
      amount: Number(amount),
      month: month.trim(),
      year: Number(year),
      billType: resolvedBillType,
      dueDate: new Date(dueDate),
      description: description ? description.trim() : `Monthly ${resolvedBillType} - ${month} ${year}`,
      notes: notes ? notes.trim() : '',
      status: 'Pending',
      createdBy: req.user._id,
    });

    const populatedBill = await Bill.findById(bill._id)
      .populate('flat', 'wing flatNumber floor type status')
      .populate('resident', 'name email phone');

    res.status(201).json({
      success: true,
      message: 'Bill created successfully',
      data: populatedBill,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get bills for the logged-in resident
// @route   GET /api/bills/my
// @access  Private (Resident)
const getMyBills = async (req, res, next) => {
  try {
    const { status, month, year } = req.query;
    const filter = { resident: req.user._id };

    if (status && ['Pending', 'Paid', 'Overdue'].includes(status)) {
      filter.status = status;
    }
    if (month) filter.month = month;
    if (year) filter.year = Number(year);

    const bills = await Bill.find(filter)
      .populate('flat', 'wing flatNumber floor type status')
      .populate('resident', 'name email phone')
      .sort({ dueDate: -1, createdAt: -1 });

    const totalPendingAmount = bills
      .filter((b) => b.status === 'Pending' || b.status === 'Overdue')
      .reduce((sum, b) => sum + (b.amount || 0), 0);

    const totalPaidAmount = bills
      .filter((b) => b.status === 'Paid')
      .reduce((sum, b) => sum + (b.amount || 0), 0);

    res.status(200).json({
      success: true,
      count: bills.length,
      summary: {
        totalPendingAmount,
        totalPaidAmount,
        totalBills: bills.length,
        pendingCount: bills.filter((b) => b.status === 'Pending').length,
        overdueCount: bills.filter((b) => b.status === 'Overdue').length,
        paidCount: bills.filter((b) => b.status === 'Paid').length,
      },
      data: bills,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all bills across society (Admin view)
// @route   GET /api/bills
// @access  Private (Admin)
const getAllBills = async (req, res, next) => {
  try {
    const { status, month, year, flat, resident } = req.query;
    const filter = {};

    if (status && ['Pending', 'Paid', 'Overdue'].includes(status)) {
      filter.status = status;
    }
    if (month) filter.month = month;
    if (year) filter.year = Number(year);
    if (flat) filter.flat = flat;
    if (resident) filter.resident = resident;

    const bills = await Bill.find(filter)
      .populate('flat', 'wing flatNumber floor type status')
      .populate('resident', 'name email phone')
      .sort({ dueDate: -1, createdAt: -1 });

    // Aggregate summary
    const totalBilledAmount = bills.reduce((sum, b) => sum + (b.amount || 0), 0);
    const totalCollectedAmount = bills
      .filter((b) => b.status === 'Paid')
      .reduce((sum, b) => sum + (b.amount || 0), 0);
    const totalPendingAmount = bills
      .filter((b) => b.status === 'Pending' || b.status === 'Overdue')
      .reduce((sum, b) => sum + (b.amount || 0), 0);

    res.status(200).json({
      success: true,
      count: bills.length,
      summary: {
        totalBilledAmount,
        totalCollectedAmount,
        totalPendingAmount,
        pendingCount: bills.filter((b) => b.status === 'Pending').length,
        overdueCount: bills.filter((b) => b.status === 'Overdue').length,
        paidCount: bills.filter((b) => b.status === 'Paid').length,
      },
      data: bills,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single bill by ID
// @route   GET /api/bills/:id
// @access  Private (Resident for own, Admin)
const getBillById = async (req, res, next) => {
  try {
    const bill = await Bill.findById(req.params.id)
      .populate('flat', 'wing flatNumber floor type status')
      .populate('resident', 'name email phone');

    if (!bill) {
      return res.status(404).json({
        success: false,
        message: 'Bill not found',
      });
    }

    // Role check: Resident can only view their own bill
    if (req.user.role === 'resident' && !bill.resident._id.equals(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view this bill',
      });
    }

    res.status(200).json({
      success: true,
      data: bill,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update bill status / Mark as Paid (Admin only)
// @route   PATCH /api/bills/:id/status
// @access  Private (Admin)
const updateBillStatus = async (req, res, next) => {
  try {
    const { status, paymentMethod, paymentReference, paidDate, notes } = req.body;

    const validStatuses = ['Pending', 'Paid', 'Overdue'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const bill = await Bill.findById(req.params.id);
    if (!bill) {
      return res.status(404).json({
        success: false,
        message: 'Bill not found',
      });
    }

    if (status) {
      bill.status = status;
      if (status === 'Paid') {
        bill.paidDate = paidDate ? new Date(paidDate) : new Date();
      } else {
        bill.paidDate = null;
      }
    }

    if (paymentMethod !== undefined) {
      bill.paymentMethod = paymentMethod;
    }
    if (paymentReference !== undefined) {
      bill.paymentReference = paymentReference.trim();
    }
    if (notes !== undefined) {
      bill.notes = notes.trim();
    }

    await bill.save();

    const updatedBill = await Bill.findById(bill._id)
      .populate('flat', 'wing flatNumber floor type status')
      .populate('resident', 'name email phone');

    res.status(200).json({
      success: true,
      message: `Bill marked as ${bill.status} successfully`,
      data: updatedBill,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a bill (Admin only)
// @route   DELETE /api/bills/:id
// @access  Private (Admin)
const deleteBill = async (req, res, next) => {
  try {
    const bill = await Bill.findById(req.params.id);
    if (!bill) {
      return res.status(404).json({
        success: false,
        message: 'Bill not found',
      });
    }

    await Bill.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Bill deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBill,
  getMyBills,
  getAllBills,
  getBillById,
  updateBillStatus,
  deleteBill,
};
