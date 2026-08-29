const mongoose = require('mongoose');

const visitorSchema = new mongoose.Schema(
  {
    visitorName: {
      type: String,
      required: [true, 'Visitor name is required'],
      trim: true,
      maxlength: [60, 'Visitor name cannot exceed 60 characters'],
    },
    phone: {
      type: String,
      required: [true, 'Visitor phone number is required'],
      trim: true,
    },
    purpose: {
      type: String,
      required: [true, 'Purpose of visit is required'],
      enum: {
        values: [
          'Guest / Family',
          'Delivery',
          'Home Service / Repair',
          'Cab / Taxi',
          'Official / Business',
          'Maintenance',
          'Other',
        ],
        message: '{VALUE} is not a supported visit purpose',
      },
      default: 'Guest / Family',
    },
    flat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Flat',
      required: [true, 'Flat reference is required'],
    },
    resident: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Host resident reference is required'],
    },
    expectedDate: {
      type: Date,
      required: [true, 'Expected arrival date is required'],
    },
    expectedTime: {
      type: String,
      trim: true,
      default: '',
    },
    vehicleNumber: {
      type: String,
      trim: true,
      uppercase: true,
      default: '',
    },
    status: {
      type: String,
      enum: {
        values: ['Pre-Approved', 'Checked In', 'Checked Out', 'Cancelled'],
        message: '{VALUE} is not a valid visitor status',
      },
      default: 'Pre-Approved',
    },
    checkInTime: {
      type: Date,
      default: null,
    },
    checkOutTime: {
      type: Date,
      default: null,
    },
    passCode: {
      type: String,
      unique: true,
      required: true,
      trim: true,
      uppercase: true,
    },
    securityGuard: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Query indexes
visitorSchema.index({ resident: 1, expectedDate: -1 });
visitorSchema.index({ status: 1, expectedDate: 1 });
visitorSchema.index({ flat: 1, createdAt: -1 });

const Visitor = mongoose.model('Visitor', visitorSchema);

module.exports = Visitor;
