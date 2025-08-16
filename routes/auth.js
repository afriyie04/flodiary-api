const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { generateToken } = require('../middleware/auth');
const { validateRegister, validateLogin } = require('../middleware/validation');

// POST /api/auth/signup
router.post('/signup', validateRegister, async (req, res) => {
  try {
    const { firstName, lastName, username, email, password } = req.body;

    // Check if user already exists
    const emailExists = await User.emailExists(email);
    if (emailExists) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    const usernameExists = await User.usernameExists(username);
    if (usernameExists) {
      return res.status(400).json({ error: 'Username already taken' });
    }

    // Create new user
    const user = new User({ firstName, lastName, username, email, password });
    await user.save();
    
    const token = generateToken(user._id);

    res.status(201).json({
      message: 'User created successfully',
      user: user.toSafeObject(),
      token
    });
  } catch (error) {
    console.error('Signup error:', error);
    
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
    
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// POST /api/auth/login
router.post('/login', validateLogin, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by credentials using static method
    const user = await User.findByCredentials(email, password);

    // Update last login
    await user.updateLastLogin();

    // Generate token
    const token = generateToken(user._id);

    res.json({
      message: 'Login successful',
      user: user.toSafeObject(),
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    
    if (error.message === 'Invalid email or password') {
      return res.status(401).json({ error: error.message });
    }
    
    res.status(500).json({ error: 'Failed to login' });
  }
});

module.exports = router;