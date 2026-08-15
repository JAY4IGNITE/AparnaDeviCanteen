const express = require('express');
const supabase = require('../db');
const { protect } = require('../middleware/auth');

const router = express.Router();

// GET /api/menu — Fetch all available menu items
router.get('/', protect, async (req, res) => {
  try {
    const { data: menuItems, error } = await supabase
      .from('menu_items')
      .select('*')
      .eq('is_available', true)
      .order('category', { ascending: true })
      .order('item_name', { ascending: true });

    if (error) {
      return res.status(500).json({ success: false, message: error.message });
    }

    res.json({ success: true, data: menuItems });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
