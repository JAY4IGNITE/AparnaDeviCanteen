const express = require('express');
const router = express.Router();
const supabase = require('../db');

let announcementsCache = {
  data: null,
  timestamp: 0
};

// GET /api/announcements
// Get all active announcements
router.get('/', async (req, res, next) => {
  try {
    const now = Date.now();
    if (announcementsCache.data && (now - announcementsCache.timestamp < 30000)) {
      res.setHeader('Cache-Control', 'public, max-age=30, stale-while-revalidate=60');
      return res.json(announcementsCache.data);
    }

    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching announcements:', error.message);
      return res.status(500).json({ success: false, message: 'Failed to fetch announcements.' });
    }

    const responsePayload = { success: true, count: data.length, data };
    announcementsCache = { data: responsePayload, timestamp: Date.now() };

    res.setHeader('Cache-Control', 'public, max-age=30, stale-while-revalidate=60');
    res.json(responsePayload);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
