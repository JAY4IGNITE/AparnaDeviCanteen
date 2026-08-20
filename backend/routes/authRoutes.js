const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const supabase = require('../db');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Generate JWT token
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// POST /api/auth/register — Register a new customer
router.post('/register', async (req, res) => {
  try {
    const { name, phone, password, confirmPassword, hostelBlock } = req.body;

    if (!name || !phone || !password || !confirmPassword || !hostelBlock) {
      return res.status(400).json({ success: false, message: 'Please fill all required fields' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    // Check if phone already exists
    const trimmedPhone = phone.trim();
    const { data: existingPhone } = await supabase
      .from('users')
      .select('id')
      .eq('phone', trimmedPhone)
      .maybeSingle();

    if (existingPhone) {
      return res.status(400).json({ success: false, message: 'Phone number already registered' });
    }



    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const { error } = await supabase.from('users').insert({
      name: name.trim(),
      phone: trimmedPhone,
      email: null,
      password: hashedPassword,
      hostel_block: hostelBlock,
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

// POST /api/auth/login — Login (universal email or phone identifier)
router.post('/login', async (req, res) => {
  try {
    const { identifier, phone, email, password, role } = req.body;

    if (!password) {
      return res.status(400).json({ success: false, message: 'Password is required' });
    }

    let query = supabase.from('users').select('*');

    // 1. Support new unified identifier
    if (identifier) {
      const trimmed = identifier.trim();
      if (trimmed.includes('@')) {
        query = query.eq('email', trimmed.toLowerCase());
      } else {
        query = query.eq('phone', trimmed);
      }
    }
    // 2. Support legacy role-based login format for backward compatibility
    else if (role === 'admin') {
      if (!email) {
        return res.status(400).json({ success: false, message: 'Email is required for admin login' });
      }
      query = query.eq('email', email.trim().toLowerCase()).eq('role', 'admin');
    } else {
      if (!phone) {
        return res.status(400).json({ success: false, message: 'Phone number is required' });
      }
      query = query.eq('phone', phone.trim()).eq('role', 'customer');
    }

    const { data: user, error } = await query.maybeSingle();

    if (error || !user) {
      return res.status(404).json({ success: false, message: 'Account not found. Please sign up.' });
    }

    if (user.is_blocked) {
      return res.status(403).json({ success: false, message: 'Your account has been blocked' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Incorrect password. Please try again.' });
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

// PUT /api/auth/profile — Update user profile details
router.put('/profile', protect, async (req, res) => {
  try {
    const { name, phone, hostelBlock } = req.body;

    if (!name || !phone || !hostelBlock) {
      return res.status(400).json({ success: false, message: 'Please fill all required fields' });
    }

    const trimmedPhone = phone.trim();

    // Check if phone number is already registered by another user
    if (trimmedPhone !== req.user.phone) {
      const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('id')
        .eq('phone', trimmedPhone)
        .neq('id', req.user.id)
        .maybeSingle();

      if (existingUser) {
        return res.status(400).json({ success: false, message: 'Phone number already in use by another account' });
      }
    }

    // Update details in database
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update({
        name: name.trim(),
        phone: trimmedPhone,
        hostel_block: hostelBlock
      })
      .eq('id', req.user.id)
      .select()
      .single();

    if (updateError) {
      return res.status(500).json({ success: false, message: updateError.message });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully!',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        role: updatedUser.role,
        phone: updatedUser.phone,
        email: updatedUser.email,
        hostelBlock: updatedUser.hostel_block
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/auth/password — Change user password
router.put('/password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ success: false, message: 'All password fields are required' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'New passwords do not match' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters long' });
    }

    // Retrieve user password hash from DB
    const { data: dbUser, error: dbError } = await supabase
      .from('users')
      .select('password')
      .eq('id', req.user.id)
      .single();

    if (dbError || !dbUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, dbUser.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Incorrect current password' });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password in DB
    const { error: updateError } = await supabase
      .from('users')
      .update({ password: hashedPassword })
      .eq('id', req.user.id);

    if (updateError) {
      return res.status(500).json({ success: false, message: updateError.message });
    }

    res.json({ success: true, message: 'Password changed successfully!' });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
