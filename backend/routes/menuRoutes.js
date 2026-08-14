const express = require('express');
const Menu = require('../models/Menu');
const { protect } = require('../middleware/auth');

const router = express.Router();

// GET /api/menu — Fetch all available menu items
router.get('/', protect, async (req, res) => {
  try {
    const menuItems = await Menu.find({ isAvailable: true }).sort({ category: 1, itemName: 1 });
    res.json({ success: true, data: menuItems });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
