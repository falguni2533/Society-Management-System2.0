const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema(
  {
    resident: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Resident reference is required'],
    },
    title: {
      type: String,
      required: [true, 'Please provide a complaint title'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please provide a detailed description'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Please specify a category'],
      enum: {
        values: ['Plumbing', 'Electrical', 'Cleaning', 'Security', 'Other'],
        message: '{VALUE} is not a valid complaint category',
      },
      default: 'Other',
    },
    priority: {
      type: String,
      required: [true, 'Please specify a priority'],
      enum: {
        values: ['Low', 'Medium', 'High'],
        message: '{VALUE} is not a valid priority',
      },
      default: 'Medium',
    },
    status: {
      type: String,
      enum: {
        values: ['Open', 'In Progress', 'Resolved'],
        message: '{VALUE} is not a valid status',
      },
      default: 'Open',
    },
    resolutionNote: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Index for query performance
complaintSchema.index({ resident: 1, createdAt: -1 });
complaintSchema.index({ status: 1, category: 1 });

const Complaint = mongoose.model('Complaint', complaintSchema);

module.exports = Complaint;
