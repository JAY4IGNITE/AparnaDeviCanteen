const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const supabase = require('../db');

const router = express.Router();

// Generate JWT token
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// POST /api/auth/register — Register a new customer
router.post('/register', async (req, res) => {
  try {
    const { name, phone, password, confirmPassword, hostelBlock } = req.body;

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
    const { data: existingPhone } = await supabase
      .from('users')
      .select('id')
      .eq('phone', phone)
      .maybeSingle();

    if (existingPhone) {
      return res.status(400).json({ success: false, message: 'Phone number already registered' });
    }



    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const { error } = await supabase.from('users').insert({
      name,
      phone,
      email: null,
      password: hashedPassword,
      hostel_block: hostelBlock || null,
      role: 'customer'
    });

    if (error) {
      return res.status(500).json({ success: false, message: error.message });
    }

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

    let query = supabase.from('users').select('*');

    if (role === 'admin') {
      if (!email) {
        return res.status(400).json({ success: false, message: 'Email is required for admin login' });
      }
      query = query.eq('email', email.toLowerCase()).eq('role', 'admin');
    } else {
      if (!phone) {
        return res.status(400).json({ success: false, message: 'Phone number is required' });
      }
      query = query.eq('phone', phone).eq('role', 'customer');
    }

    const { data: user, error } = await query.maybeSingle();

    if (error || !user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (user.is_blocked) {
      return res.status(403).json({ success: false, message: 'Your account has been blocked' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = generateToken(user.id, user.role);

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
        phone: user.phone,
        email: user.email,
        hostelBlock: user.hostel_block
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
