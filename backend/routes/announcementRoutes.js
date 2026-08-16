const express = require('express');
const router = express.Router();
const supabase = require('../db');

// GET /api/announcements
// Get all active announcements
router.get('/', async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching announcements:', error.message);
      return res.status(500).json({ success: false, message: 'Failed to fetch announcements.' });
    }

    res.json({ success: true, count: data.length, data });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
