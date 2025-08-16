const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');
const { validateProfile, validatePasswordChange } = require('../middleware/validation');

// GET /api/users/profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    // User is already loaded in authenticateToken middleware
    res.json({
      user: req.user.toSafeObject()
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
});

// PUT /api/users/profile
router.put('/profile', authenticateToken, validateProfile, async (req, res) => {
  try {
    const { firstName, lastName, username, email } = req.body;

    // Check if new email is already taken by another user
    if (email !== req.user.email) {
      const emailExists = await User.emailExists(email);
      if (emailExists) {
        return res.status(400).json({ error: 'Email already taken' });
      }
    }

    // Check if new username is already taken by another user
    if (username !== req.user.username) {
      const usernameExists = await User.usernameExists(username);
      if (usernameExists) {
        return res.status(400).json({ error: 'Username already taken' });
      }
    }

    // Update user profile
    req.user.firstName = firstName;
    req.user.lastName = lastName;
    req.user.username = username;
    req.user.email = email;
    
    const updatedUser = await req.user.save();

    res.json({
      message: 'Profile updated successfully',
      user: updatedUser.toSafeObject()
    });
  } catch (error) {
    console.error('Update profile error:', error);
    
    // Handle mongoose validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ error: 'Validation failed', details: messages });
    }
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({ error: `${field} already exists` });
    }
    
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// PUT /api/users/password
router.put('/password', authenticateToken, validatePasswordChange, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Get user with password field included
    const userWithPassword = await User.findById(req.user._id).select('+password');
    
    // Verify current password
    const isCurrentPasswordValid = await userWithPassword.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    // Update password
    userWithPassword.password = newPassword;
    await userWithPassword.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    
    // Handle mongoose validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ error: 'Validation failed', details: messages });
    }
    
    res.status(500).json({ error: 'Failed to change password' });
  }
});

module.exports = router;