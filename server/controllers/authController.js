const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Flat = require('../models/Flat');

// Helper to generate JWT
const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'super_secret_jwt_key_society_management_2026_dev',
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    }
  );
};

// @desc    Register a user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const { name, email, password, phone, role, flatId } = req.body;

    if (!name || !email || !password || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, password, and phone number',
      });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists',
      });
    }

    // Validate role if specified
    const userRole = role && ['admin', 'resident', 'security'].includes(role)
      ? role
      : 'resident';

    // If flatId is provided for resident, verify it exists
    let assignedFlat = null;
    if (flatId) {
      assignedFlat = await Flat.findById(flatId);
      if (!assignedFlat) {
        return res.status(404).json({
          success: false,
          message: 'Selected flat was not found',
        });
      }
    }

    // Create user
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      phone,
      role: userRole,
      flat: assignedFlat ? assignedFlat._id : null,
    });

    // If flat was assigned, update flat's residents list and status
    if (assignedFlat) {
      if (!assignedFlat.residents.includes(user._id)) {
        assignedFlat.residents.push(user._id);
        assignedFlat.status = 'occupied';
        await assignedFlat.save();
      }
    }

    // Populate flat details for response
    const populatedUser = await User.findById(user._id).populate('flat');
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Account registered successfully',
      token,
      user: populatedUser,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password',
      });
    }

    // Check for user (must select +password since it's hidden by default)
    const user = await User.findOne({ email: email.toLowerCase() })
      .select('+password')
      .populate('flat');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Check if user is active
    if (user.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'Your account is deactivated. Please contact society administration.',
      });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private (All Roles)
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate('flat');
    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get list of all flats for registration selection
// @route   GET /api/auth/flats
// @access  Public
const getFlatsForRegistration = async (req, res, next) => {
  try {
    const flats = await Flat.find().sort({ wing: 1, flatNumber: 1 });
    res.status(200).json({
      success: true,
      count: flats.length,
      flats,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
  getFlatsForRegistration,
};
