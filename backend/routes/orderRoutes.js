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
    // Fetch ALL orders to assign a global sequential ID (e.g. #1, #2)
    const { data: allOrders, error } = await supabase
      .from('orders')
      .select('*, order_items(*, menu_items(item_name, price))')
      .order('created_at', { ascending: true }); // Oldest first to match #1

    if (error) {
      return res.status(500).json({ success: false, message: error.message });
    }

    // Attach order_number (global sequence)
    const withNumbers = allOrders.map((o, idx) => ({ ...o, order_number: idx + 1 }));

    // Filter to just this customer's orders and reverse sort for display (newest first)
    const customerOrders = withNumbers
      .filter(o => o.customer_id === req.user.id)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    res.json({ success: true, data: customerOrders });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/orders/:id/cancel — Cancel customer's order
router.put('/:id/cancel', protect, async (req, res) => {
  try {
    // 1. Fetch order
    const { data: order, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', req.params.id)
      .maybeSingle();

    if (error || !order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // 2. Validate ownership
    if (order.customer_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized to cancel this order' });
    }

    // 3. Validate status (must be Pending)
    if (order.status !== 'Pending') {
      return res.status(400).json({ success: false, message: `Cannot cancel an order that is already ${order.status.toLowerCase()}` });
    }

    // 4. Update status to Cancelled
    const { data: updatedOrder, error: updateError } = await supabase
      .from('orders')
      .update({ status: 'Cancelled' })
      .eq('id', req.params.id)
      .select()
      .single();

    if (updateError) {
      return res.status(500).json({ success: false, message: updateError.message });
    }

    res.json({ success: true, data: updatedOrder });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
