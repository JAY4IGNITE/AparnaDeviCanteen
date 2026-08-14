const express = require('express');
const Order = require('../models/Order');
const Menu = require('../models/Menu');
const { protect } = require('../middleware/auth');

const router = express.Router();

// POST /api/orders — Place a new order
router.post('/', protect, async (req, res) => {
  try {
    const { items } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'No items in order' });
    }

    // Validate items and calculate total
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const menuItem = await Menu.findById(item.menuItem);
      if (!menuItem) {
        return res.status(404).json({ success: false, message: `Menu item not found: ${item.menuItem}` });
      }
      if (!menuItem.isAvailable) {
        return res.status(400).json({ success: false, message: `${menuItem.itemName} is currently unavailable` });
      }

      const quantity = parseInt(item.quantity) || 1;
      const itemTotal = menuItem.price * quantity;
      totalAmount += itemTotal;

      orderItems.push({
        menuItem: menuItem._id,
        itemName: menuItem.itemName,
        quantity,
        price: menuItem.price
      });
    }

    const order = await Order.create({
      customer: req.user._id,
      items: orderItems,
      totalAmount,
      status: 'Pending'
    });

    res.status(201).json({ success: true, data: order });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/orders/me — Get logged-in customer's orders
router.get('/me', protect, async (req, res) => {
  try {
    const orders = await Order.find({ customer: req.user._id })
      .sort({ createdAt: -1 })
      .populate('items.menuItem', 'itemName price');

    res.json({ success: true, data: orders });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
