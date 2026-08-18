const mongoose = require('mongoose');

const noticeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a notice title'],
      trim: true,
      maxlength: [150, 'Notice title cannot exceed 150 characters'],
    },
    content: {
      type: String,
      required: [true, 'Please provide notice content'],
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Creator reference is required'],
    },
  },
  {
    timestamps: true,
  }
);

noticeSchema.index({ createdAt: -1 });

const Notice = mongoose.model('Notice', noticeSchema);

module.exports = Notice;
