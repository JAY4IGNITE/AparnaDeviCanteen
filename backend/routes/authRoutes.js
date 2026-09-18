const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const supabase = require('../db');
const emailService = require('../services/emailService');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Generate JWT token
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// POST /api/auth/register — Register a new customer
router.post('/register', async (req, res) => {
  try {
    const { name, phone, password, confirmPassword, hostelBlock, email } = req.body;

    if (!name || !phone || !password || !hostelBlock || !email) {
      return res.status(400).json({ success: false, message: 'Please fill all required fields' });
    }

    const trimmedEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      return res.status(400).json({ success: false, message: 'Please enter a valid email address' });
    }

    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    // Check if phone already exists
    const trimmedPhone = phone.trim();

    // Validate phone number format
    const phoneRegex = /^(?:\+91|91)?\d{10}$/;
    if (!phoneRegex.test(trimmedPhone)) {
      return res.status(400).json({ success: false, message: 'Please enter a valid phone number (10 digits, or 12/13 digits starting with 91 or +91)' });
    }

    const tenDigitPhone = trimmedPhone.slice(-10);
    const possibleFormats = [tenDigitPhone, `91${tenDigitPhone}`, `+91${tenDigitPhone}`];

    const { data: existingPhone } = await supabase
      .from('users')
      .select('id')
      .in('phone', possibleFormats)
      .maybeSingle();

    if (existingPhone) {
      return res.status(400).json({ success: false, message: 'Phone number already registered' });
    }

    const { data: existingEmail } = await supabase
      .from('users')
      .select('id')
      .eq('email', trimmedEmail)
      .maybeSingle();

    if (existingEmail) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const { error } = await supabase.from('users').insert({
      name: name.trim(),
      phone: trimmedPhone,
      email: trimmedEmail,
      password: hashedPassword,
      hostel_block: hostelBlock,
      role: 'customer',
      verification_token: verificationToken,
      verification_expires: verificationExpires.toISOString()
    });

    if (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
    
    try {
      await emailService.sendVerificationEmail(trimmedEmail, verificationToken);
    } catch (emailErr) {
      console.error('Failed to send verification email during registration', emailErr);
    }

    res.status(201).json({
      success: true,
      message: 'Registration successful! Please check your email to verify your account.'
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
        const phoneRegex = /^(?:\+91|91)?\d{10}$/;
        if (phoneRegex.test(trimmed)) {
          const tenDigitPhone = trimmed.slice(-10);
          const possibleFormats = [tenDigitPhone, `91${tenDigitPhone}`, `+91${tenDigitPhone}`];
          query = query.in('phone', possibleFormats);
        } else {
          query = query.eq('phone', trimmed);
        }
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
      const trimmed = phone.trim();
      const phoneRegex = /^(?:\+91|91)?\d{10}$/;
      if (phoneRegex.test(trimmed)) {
        const tenDigitPhone = trimmed.slice(-10);
        const possibleFormats = [tenDigitPhone, `91${tenDigitPhone}`, `+91${tenDigitPhone}`];
        query = query.in('phone', possibleFormats).eq('role', 'customer');
      } else {
        query = query.eq('phone', trimmed).eq('role', 'customer');
      }
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
        email_verified: user.email_verified,
        hostelBlock: user.hostel_block
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/auth/update-email — Update user email (for existing users who didn't provide one)
router.put('/update-email', protect, async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const trimmedEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      return res.status(400).json({ success: false, message: 'Please enter a valid email address' });
    }

    // Check if email is already used by another user
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('email', trimmedEmail)
      .neq('id', req.user.id)
      .maybeSingle();

    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already in use by another account' });
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Update details in database
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update({ 
        email: trimmedEmail,
        verification_token: verificationToken,
        verification_expires: verificationExpires.toISOString(),
        email_verified: false
      })
      .eq('id', req.user.id)
      .select()
      .single();

    if (updateError) {
      return res.status(500).json({ success: false, message: updateError.message });
    }

    try {
      await emailService.sendVerificationEmail(trimmedEmail, verificationToken);
    } catch (emailErr) {
      console.error('Failed to send verification email during update', emailErr);
    }

    res.json({
      success: true,
      message: 'Email updated successfully!',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        role: updatedUser.role,
        phone: updatedUser.phone,
        email: updatedUser.email,
        email_verified: updatedUser.email_verified,
        hostelBlock: updatedUser.hostel_block
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

    // Validate phone number format
    const phoneRegex = /^(?:\+91|91)?\d{10}$/;
    if (!phoneRegex.test(trimmedPhone)) {
      return res.status(400).json({ success: false, message: 'Please enter a valid phone number (10 digits, or 12/13 digits starting with 91 or +91)' });
    }

    // Check if phone number is already registered by another user
    const tenDigitPhone = trimmedPhone.slice(-10);
    const possibleFormats = [tenDigitPhone, `91${tenDigitPhone}`, `+91${tenDigitPhone}`];

    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id')
      .in('phone', possibleFormats)
      .neq('id', req.user.id)
      .maybeSingle();

    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Phone number already in use by another account' });
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
        email_verified: updatedUser.email_verified,
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

    if (dbError) {
      console.error('Database error in protect middleware:', dbError);
      return res.status(500).json({ success: false, message: `Database error: ${dbError.message}` });
    }
    if (!dbUser) {
      return res.status(401).json({ success: false, message: 'User not found' });
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

// POST /api/auth/verify-email
router.post('/verify-email', async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ success: false, message: 'Token is required' });

    const { data: user, error } = await supabase
      .from('users')
      .select('id, verification_expires')
      .eq('verification_token', token)
      .maybeSingle();

    if (error || !user) {
      return res.status(400).json({ success: false, message: 'Invalid verification token' });
    }

    if (new Date(user.verification_expires) < new Date()) {
      return res.status(400).json({ success: false, message: 'Verification token has expired. Please request a new one.' });
    }

    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update({ 
        email_verified: true, 
        verification_token: null, 
        verification_expires: null 
      })
      .eq('id', user.id)
      .select('id, name, role, phone, email, email_verified, hostel_block')
      .single();

    if (updateError) {
      return res.status(500).json({ success: false, message: updateError.message });
    }

    res.json({ 
      success: true, 
      message: 'Email verified successfully!',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        role: updatedUser.role,
        phone: updatedUser.phone,
        email: updatedUser.email,
        email_verified: updatedUser.email_verified,
        hostelBlock: updatedUser.hostel_block
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/auth/resend-verification
router.post('/resend-verification', protect, async (req, res) => {
  try {
    const { email } = req.body;

    const { data: currentUser, error } = await supabase
      .from('users')
      .select('id, email, email_verified')
      .eq('id', req.user.id)
      .single();

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ success: false, message: `Database error: ${error.message}` });
    }
    if (!currentUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    let targetEmail = currentUser.email;

    if (email && email.trim()) {
      const trimmedEmail = email.trim().toLowerCase();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmedEmail)) {
        return res.status(400).json({ success: false, message: 'Please enter a valid email address' });
      }

      // Check if email belongs to another user
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', trimmedEmail)
        .neq('id', req.user.id)
        .maybeSingle();

      if (existingUser) {
        return res.status(400).json({ success: false, message: 'Email already registered by another account' });
      }

      targetEmail = trimmedEmail;
    }

    if (!targetEmail) {
      return res.status(400).json({ success: false, message: 'No email address provided' });
    }

    if (currentUser.email_verified && targetEmail === currentUser.email) {
      return res.status(400).json({ success: false, message: 'Email is already verified' });
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update({ 
        email: targetEmail,
        email_verified: false,
        verification_token: verificationToken,
        verification_expires: verificationExpires.toISOString()
      })
      .eq('id', req.user.id)
      .select('id, name, role, phone, email, email_verified, hostel_block')
      .single();

    if (updateError) {
      return res.status(500).json({ success: false, message: updateError.message });
    }

    try {
      await emailService.sendVerificationEmail(targetEmail, verificationToken);
      res.json({ 
        success: true, 
        message: `Verification email sent successfully to ${targetEmail}`,
        user: {
          id: updatedUser.id,
          name: updatedUser.name,
          role: updatedUser.role,
          phone: updatedUser.phone,
          email: updatedUser.email,
          email_verified: updatedUser.email_verified,
          hostelBlock: updatedUser.hostel_block
        }
      });
    } catch (emailErr) {
      console.error('Failed to resend verification email', emailErr);
      res.status(500).json({ success: false, message: 'Failed to send email. Please try again later.' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/auth/check-verification
router.post('/check-verification', async (req, res) => {
  try {
    const { identifier } = req.body;
    if (!identifier || typeof identifier !== 'string' || !identifier.trim()) {
      return res.json({ success: true, isVerified: false });
    }

    const value = identifier.trim().toLowerCase();
    const isEmail = value.includes('@');

    let query = supabase.from('users').select('id, email, email_verified');
    if (isEmail) {
      query = query.eq('email', value);
    } else {
      query = query.eq('phone', value);
    }

    const { data: user, error } = await query.maybeSingle();

    if (error || !user) {
      return res.json({ success: true, isVerified: false });
    }

    return res.json({
      success: true,
      isVerified: !!user.email_verified
    });
  } catch (err) {
    return res.json({ success: false, isVerified: false });
  }
});

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const trimmedEmail = email.trim().toLowerCase();

    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, email_verified')
      .eq('email', trimmedEmail)
      .maybeSingle();

    if (error || !user) {
      return res.json({ success: true, message: 'If an account exists with a verified email, a password reset link has been sent.' });
    }

    if (!user.email_verified) {
      return res.status(400).json({
        success: false,
        message: 'Password reset is only available for accounts with a verified email address. Please verify your email first.'
      });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    const { error: updateError } = await supabase
      .from('users')
      .update({ 
        reset_token: resetToken,
        reset_expires: resetExpires.toISOString()
      })
      .eq('id', user.id);

    if (!updateError) {
      try {
        await emailService.sendPasswordResetEmail(user.email, resetToken);
      } catch (emailErr) {
        console.error('Failed to send password reset email', emailErr);
      }
    }

    res.json({ success: true, message: 'If an account exists with a verified email, a password reset link has been sent.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/auth/reset-password
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword, confirmPassword } = req.body;
    if (!token || !newPassword || !confirmPassword) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match' });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('id, reset_expires')
      .eq('reset_token', token)
      .maybeSingle();

    if (error || !user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
    }

    if (new Date(user.reset_expires) < new Date()) {
      return res.status(400).json({ success: false, message: 'Reset token has expired. Please request a new one.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    const { error: updateError } = await supabase
      .from('users')
      .update({ 
        password: hashedPassword,
        reset_token: null,
        reset_expires: null
      })
      .eq('id', user.id);

    if (updateError) {
      return res.status(500).json({ success: false, message: updateError.message });
    }

    res.json({ success: true, message: 'Password has been reset successfully. You can now login.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
