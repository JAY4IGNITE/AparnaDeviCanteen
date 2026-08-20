const express = require('express');
const supabase = require('../db');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

// POST /api/feedback — Submit a feedback (Customer)
router.post('/', protect, async (req, res) => {
  try {
    const { opinion } = req.body;

    if (!opinion || opinion.trim() === '') {
      return res.status(400).json({ success: false, message: 'Please enter your feedback opinion' });
    }

    const { data: feedback, error } = await supabase
      .from('feedbacks')
      .insert({
        customer_id: req.user.id,
        opinion: opinion.trim()
      })
      .select()
      .single();

    if (error) {
      return res.status(500).json({ success: false, message: error.message });
    }

    res.status(201).json({ success: true, data: feedback });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/feedback/me — Get logged-in customer's feedbacks (Customer)
router.get('/me', protect, async (req, res) => {
  try {
    const { data: feedbacks, error } = await supabase
      .from('feedbacks')
      .select('*')
      .eq('customer_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ success: false, message: error.message });
    }

    res.json({ success: true, data: feedbacks });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/feedback — Get all feedbacks (Admin only)
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const { data: feedbacks, error } = await supabase
      .from('feedbacks')
      .select(`
        *,
        users!feedbacks_customer_id_fkey (name, phone, hostel_block)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ success: false, message: error.message });
    }

    // Process properties for a clean model in frontend
    const processed = feedbacks.map(f => ({
      ...f,
      customer: f.users,
      users: undefined
    }));

    res.json({ success: true, data: processed });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
