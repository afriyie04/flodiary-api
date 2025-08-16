const { body, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
};

// Auth validation rules
const validateRegister = [
  body('firstName').trim().isLength({ min: 1 }).withMessage('First name is required'),
  body('lastName').trim().isLength({ min: 1 }).withMessage('Last name is required'),
  body('username').trim().isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  handleValidationErrors
];

const validateLogin = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').exists().withMessage('Password is required'),
  handleValidationErrors
];

// Cycle validation rules
const validateCycle = [
  body('startDate').isISO8601().withMessage('Valid start date is required'),
  body('endDate').optional().isISO8601().withMessage('Valid end date required'),
  body('cycleLength').optional().isInt({ min: 15, max: 50 }).withMessage('Cycle length must be between 15-50 days'),
  body('periodLength').optional().isInt({ min: 1, max: 15 }).withMessage('Period length must be between 1-15 days'),
  body('symptoms').optional().isArray().withMessage('Symptoms must be an array'),
  body('mood').optional().isString().withMessage('Mood must be a string'),
  body('notes').optional().isString().withMessage('Notes must be a string'),
  handleValidationErrors
];

// Daily entry validation rules
const validateDailyEntry = [
  body('date').isISO8601().withMessage('Valid date is required'),
  body('flow').optional().isIn(['none', 'spotting', 'light', 'medium', 'heavy']).withMessage('Invalid flow value'),
  body('symptoms').optional().isArray().withMessage('Symptoms must be an array'),
  body('mood').optional().isInt({ min: 1, max: 5 }).withMessage('Mood must be between 1-5'),
  body('notes').optional().isString().withMessage('Notes must be a string'),
  body('isOvulation').optional().isBoolean().withMessage('isOvulation must be boolean'),
  body('temperature').optional().isFloat({ min: 90, max: 110 }).withMessage('Temperature must be between 90-110°F'),
  handleValidationErrors
];

// Profile validation rules
const validateProfile = [
  body('firstName').trim().isLength({ min: 1 }).withMessage('First name is required'),
  body('lastName').trim().isLength({ min: 1 }).withMessage('Last name is required'),
  body('username').trim().isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  handleValidationErrors
];

const validatePasswordChange = [
  body('currentPassword').exists().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
  handleValidationErrors
];

module.exports = {
  validateRegister,
  validateLogin,
  validateCycle,
  validateDailyEntry,
  validateProfile,
  validatePasswordChange
};