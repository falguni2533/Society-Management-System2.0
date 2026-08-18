const mongoose = require('mongoose');

const flatSchema = new mongoose.Schema(
  {
    wing: {
      type: String,
      required: [true, 'Wing / Block is required'],
      trim: true,
      uppercase: true,
    },
    flatNumber: {
      type: String,
      required: [true, 'Flat number is required'],
      trim: true,
    },
    floor: {
      type: Number,
      required: [true, 'Floor number is required'],
    },
    type: {
      type: String,
      enum: ['1BHK', '2BHK', '3BHK', '4BHK', 'Studio', 'Penthouse'],
      default: '2BHK',
    },
    status: {
      type: String,
      enum: ['vacant', 'occupied'],
      default: 'vacant',
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    residents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure uniqueness of Wing + FlatNumber
flatSchema.index({ wing: 1, flatNumber: 1 }, { unique: true });

const Flat = mongoose.model('Flat', flatSchema);

module.exports = Flat;
