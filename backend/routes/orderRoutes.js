const express = require('express');
const supabase = require('../db');
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
      const { data: menuItem, error } = await supabase
        .from('menu_items')
        .select('*')
        .eq('id', item.menuItem)
        .maybeSingle();

      if (error || !menuItem) {
        return res.status(404).json({ success: false, message: `Menu item not found: ${item.menuItem}` });
      }
      if (!menuItem.is_available) {
        return res.status(400).json({ success: false, message: `${menuItem.item_name} is currently unavailable` });
      }

      const quantity = parseInt(item.quantity) || 1;
      const itemTotal = menuItem.price * quantity;
      totalAmount += itemTotal;

      orderItems.push({
        menu_item_id: menuItem.id,
        item_name: menuItem.item_name,
        quantity,
        price: menuItem.price
      });
    }

    // Insert the order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        customer_id: req.user.id,
        total_amount: totalAmount,
        status: 'Pending'
      })
      .select()
      .single();

    if (orderError) {
      return res.status(500).json({ success: false, message: orderError.message });
    }

    // Insert order items
    const itemsToInsert = orderItems.map(i => ({ ...i, order_id: order.id }));
    const { error: itemsError } = await supabase.from('order_items').insert(itemsToInsert);

    if (itemsError) {
      return res.status(500).json({ success: false, message: itemsError.message });
    }

    // Fetch complete order with items for response
    const { data: fullOrder } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('id', order.id)
      .single();

    res.status(201).json({ success: true, data: fullOrder });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/orders/me — Get logged-in customer's orders
router.get('/me', protect, async (req, res) => {
  try {
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*, order_items(*, menu_items(item_name, price))')
      .eq('customer_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ success: false, message: error.message });
    }

    res.json({ success: true, data: orders });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
