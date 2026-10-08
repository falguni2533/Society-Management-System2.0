const mongoose = require('mongoose');

const billSchema = new mongoose.Schema(
  {
    flat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Flat',
      required: [true, 'Flat reference is required'],
    },
    resident: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Resident reference is required'],
    },
    amount: {
      type: Number,
      required: [true, 'Bill amount is required'],
      min: [0, 'Amount cannot be negative'],
    },
    month: {
      type: String,
      required: [true, 'Month is required (e.g. August)'],
      trim: true,
    },
    year: {
      type: Number,
      required: [true, 'Year is required (e.g. 2026)'],
      min: [2000, 'Year must be valid'],
    },
    billType: {
      type: String,
      enum: {
        values: [
          'Maintenance',
          'Water',
          'Electricity',
          'Parking',
          'Clubhouse',
          'Special Assessment',
          'Other',
        ],
        message: '{VALUE} is not a valid bill type',
      },
      default: 'Maintenance',
    },
    dueDate: {
      type: Date,
      required: [true, 'Due date is required'],
    },
    status: {
      type: String,
      enum: {
        values: ['Pending', 'Paid', 'Overdue'],
        message: '{VALUE} is not a valid bill status',
      },
      default: 'Pending',
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    paidDate: {
      type: Date,
      default: null,
    },
    paymentMethod: {
      type: String,
      enum: {
        values: ['Cash', 'Bank Transfer', 'Cheque', 'UPI / Online', 'Card', 'Other'],
        message: '{VALUE} is not a supported payment method',
      },
      default: null,
    },
    paymentReference: {
      type: String,
      trim: true,
      default: '',
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for query optimization
billSchema.index({ resident: 1, status: 1 });
billSchema.index({ flat: 1, month: 1, year: 1 });
billSchema.index({ status: 1, dueDate: 1 });

const Bill = mongoose.model('Bill', billSchema);

module.exports = Bill;
