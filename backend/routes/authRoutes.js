const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// Generate JWT token
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// POST /api/auth/register — Register a new customer
router.post('/register', async (req, res) => {
  try {
    const { name, phone, email, password, confirmPassword, hostelBlock } = req.body;

    if (!name || !phone || !password || !confirmPassword) {
      return res.status(400).json({ success: false, message: 'Please fill all required fields' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    // Check if phone already exists
    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Phone number already registered' });
    }

    // Check if email already exists (if provided)
    if (email) {
      const existingEmail = await User.findOne({ email });
      if (existingEmail) {
        return res.status(400).json({ success: false, message: 'Email already registered' });
      }
    }

    const user = await User.create({
      name,
      phone,
      email: email || undefined,
      password,
      hostelBlock,
      role: 'customer'
    });

    res.status(201).json({
      success: true,
      message: 'Registration successful! Please login.'
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/auth/login — Login (customer with phone, admin with email)
router.post('/login', async (req, res) => {
  try {
    const { phone, email, password, role } = req.body;

    if (!password) {
      return res.status(400).json({ success: false, message: 'Password is required' });
    }

    let user;

    if (role === 'admin') {
      if (!email) {
        return res.status(400).json({ success: false, message: 'Email is required for admin login' });
      }
      user = await User.findOne({ email, role: 'admin' });
    } else {
      if (!phone) {
        return res.status(400).json({ success: false, message: 'Phone number is required' });
      }
      user = await User.findOne({ phone, role: 'customer' });
    }

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (user.isBlocked) {
      return res.status(403).json({ success: false, message: 'Your account has been blocked' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = generateToken(user._id, user.role);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        role: user.role,
        phone: user.phone,
        email: user.email,
        hostelBlock: user.hostelBlock
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
