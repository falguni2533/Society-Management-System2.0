const Notice = require('../models/Notice');

// @desc    Get all published notices
// @route   GET /api/notices
// @access  Private (Resident, Admin, Security)
const getNotices = async (req, res, next) => {
  try {
    const notices = await Notice.find()
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: notices.length,
      data: notices,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single notice by ID
// @route   GET /api/notices/:id
// @access  Private (Resident, Admin, Security)
const getNoticeById = async (req, res, next) => {
  try {
    const notice = await Notice.findById(req.params.id).populate(
      'createdBy',
      'name email'
    );

    if (!notice) {
      return res.status(404).json({
        success: false,
        message: 'Notice not found',
      });
    }

    res.status(200).json({
      success: true,
      data: notice,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new society notice
// @route   POST /api/notices
// @access  Private (Admin)
const createNotice = async (req, res, next) => {
  try {
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both title and content for the notice',
      });
    }

    const notice = await Notice.create({
      title: title.trim(),
      content: content.trim(),
      createdBy: req.user._id,
    });

    const populatedNotice = await Notice.findById(notice._id).populate(
      'createdBy',
      'name email'
    );

    res.status(201).json({
      success: true,
      message: 'Notice broadcasted successfully',
      data: populatedNotice,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a society notice
// @route   DELETE /api/notices/:id
// @access  Private (Admin)
const deleteNotice = async (req, res, next) => {
  try {
    const notice = await Notice.findById(req.params.id);

    if (!notice) {
      return res.status(404).json({
        success: false,
        message: 'Notice not found',
      });
    }

    await Notice.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Notice deleted successfully',
      id: req.params.id,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNotices,
  getNoticeById,
  createNotice,
  deleteNotice,
};
