const express = require('express');
const ExcelJS = require('exceljs');
const supabase = require('../db');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

// All admin routes require JWT + admin role
router.use(protect, adminOnly);

// ============== MENU MANAGEMENT ==============

// POST /api/admin/menu — Add a new menu item
router.post('/menu', async (req, res) => {
  try {
    const { itemName, price, category, isAvailable } = req.body;

    if (!itemName || price === undefined) {
      return res.status(400).json({ success: false, message: 'Item name and price are required' });
    }

    const { data: menuItem, error } = await supabase
      .from('menu_items')
      .insert({
        item_name: itemName,
        price,
        category: category || 'General',
        is_available: isAvailable !== undefined ? isAvailable : true
      })
      .select()
      .single();

    if (error) {
      return res.status(500).json({ success: false, message: error.message });
    }

    res.status(201).json({ success: true, data: menuItem });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/admin/menu — Get all menu items (including unavailable)
router.get('/menu', async (req, res) => {
  try {
    const { data: menuItems, error } = await supabase
      .from('menu_items')
      .select('*')
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

// PUT /api/admin/menu/:id — Edit a menu item
router.put('/menu/:id', async (req, res) => {
  try {
    const { itemName, price, category, isAvailable } = req.body;

    const { data: menuItem, error } = await supabase
      .from('menu_items')
      .update({
        item_name: itemName,
        price,
        category,
        is_available: isAvailable
      })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ success: false, message: error.message });
    }

    if (!menuItem) {
      return res.status(404).json({ success: false, message: 'Menu item not found' });
    }

    res.json({ success: true, data: menuItem });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/admin/menu/:id — Delete a menu item
router.delete('/menu/:id', async (req, res) => {
  try {
    const { data: menuItem, error } = await supabase
      .from('menu_items')
      .delete()
      .eq('id', req.params.id)
      .select()
      .single();

    if (error || !menuItem) {
      return res.status(404).json({ success: false, message: 'Menu item not found' });
    }

    res.json({ success: true, message: 'Menu item deleted' });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============== ORDER MANAGEMENT ==============

// GET /api/admin/orders — Get all orders with optional filters
// NOTE: This route must come BEFORE /orders/export to avoid route conflict
router.get('/orders', async (req, res) => {
  try {
    const { date, status } = req.query;

    let query = supabase
      .from('orders')
      .select(`
        *,
        users!orders_customer_id_fkey (name, phone, hostel_block),
        order_items (*)
      `)
      .order('created_at', { ascending: false });

    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      query = query
        .gte('created_at', startOfDay.toISOString())
        .lte('created_at', endOfDay.toISOString());
    }

    if (status) {
      query = query.eq('status', status);
    }

    const { data: orders, error } = await query;

    if (error) {
      return res.status(500).json({ success: false, message: error.message });
    }

    // Normalize to match original response shape (customer instead of users)
    const normalized = orders.map(o => ({
      ...o,
      customer: o.users,
      users: undefined
    }));

    res.json({ success: true, data: normalized });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/admin/orders/:id — Update order status
router.put('/orders/:id', async (req, res) => {
  try {
    const { status } = req.body;

    const { data: order, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', req.params.id)
      .select(`
        *,
        users!orders_customer_id_fkey (name, phone, hostel_block),
        order_items (*)
      `)
      .single();

    if (error || !order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const normalized = { ...order, customer: order.users, users: undefined };
    res.json({ success: true, data: normalized });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/admin/orders/export — Export orders to Excel
router.get('/orders/export', async (req, res) => {
  try {
    const { date } = req.query;

    let query = supabase
      .from('orders')
      .select(`
        *,
        users!orders_customer_id_fkey (name, phone, hostel_block),
        order_items (*)
      `)
      .order('created_at', { ascending: false });

    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      query = query
        .gte('created_at', startOfDay.toISOString())
        .lte('created_at', endOfDay.toISOString());
    }

    const { data: orders, error } = await query;

    if (error) {
      return res.status(500).json({ success: false, message: error.message });
    }

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Orders');

    sheet.columns = [
      { header: 'Order ID',      key: 'orderId',      width: 38 },
      { header: 'Customer Name', key: 'customerName', width: 20 },
      { header: 'Phone',         key: 'phone',        width: 15 },
      { header: 'Hostel Block',  key: 'hostelBlock',  width: 15 },
      { header: 'Items',         key: 'items',        width: 40 },
      { header: 'Total Amount',  key: 'totalAmount',  width: 15 },
      { header: 'Status',        key: 'status',       width: 12 },
      { header: 'Date',          key: 'date',         width: 20 }
    ];

    // Style header row
    sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    sheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' }
    };

    orders.forEach(order => {
      const itemsStr = (order.order_items || [])
        .map(i => `${i.item_name} x${i.quantity} (₹${i.price})`)
        .join(', ');

      sheet.addRow({
        orderId:      order.id,
        customerName: order.users?.name || 'N/A',
        phone:        order.users?.phone || 'N/A',
        hostelBlock:  order.users?.hostel_block || 'N/A',
        items:        itemsStr,
        totalAmount:  order.total_amount,
        status:       order.status,
        date:         new Date(order.created_at).toLocaleString()
      });
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=orders_${date || 'all'}.xlsx`);

    await workbook.xlsx.write(res);
    res.end();

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============== REVENUE ==============

// GET /api/admin/revenue?date=YYYY-MM-DD — Daily revenue aggregation
router.get('/revenue', async (req, res) => {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ success: false, message: 'Date parameter is required' });
    }

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const { data: orders, error } = await supabase
      .from('orders')
      .select('total_amount')
      .gte('created_at', startOfDay.toISOString())
      .lte('created_at', endOfDay.toISOString());

    if (error) {
      return res.status(500).json({ success: false, message: error.message });
    }

    const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total_amount), 0);
    const orderCount = orders.length;

    res.json({
      success: true,
      data: { date, totalRevenue, orderCount }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============== STATISTICS ==============

// GET /api/admin/statistics?date=YYYY-MM-DD — Item quantity statistics
router.get('/statistics', async (req, res) => {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ success: false, message: 'Date parameter is required' });
    }

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    // Fetch orders in date range, with their items
    const { data: orders, error } = await supabase
      .from('orders')
      .select('order_items (item_name, quantity, price)')
      .gte('created_at', startOfDay.toISOString())
      .lte('created_at', endOfDay.toISOString());

    if (error) {
      return res.status(500).json({ success: false, message: error.message });
    }

    // Aggregate item statistics in JS (replaces MongoDB $unwind + $group)
    const statsMap = {};
    for (const order of orders) {
      for (const item of (order.order_items || [])) {
        if (!statsMap[item.item_name]) {
          statsMap[item.item_name] = { _id: item.item_name, totalQuantity: 0, totalRevenue: 0 };
        }
        statsMap[item.item_name].totalQuantity += item.quantity;
        statsMap[item.item_name].totalRevenue  += Number(item.price) * item.quantity;
      }
    }

    const result = Object.values(statsMap).sort((a, b) => b.totalQuantity - a.totalQuantity);

    res.json({ success: true, data: result });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============== CUSTOMER MANAGEMENT ==============

// GET /api/admin/customers — List all customers
router.get('/customers', async (req, res) => {
  try {
    const { data: customers, error } = await supabase
      .from('users')
      .select('id, name, role, phone, email, hostel_block, is_blocked, created_at, updated_at')
      .eq('role', 'customer')
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ success: false, message: error.message });
    }

    res.json({ success: true, data: customers });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/admin/customers/:id — Delete a customer
router.delete('/customers/:id', async (req, res) => {
  try {
    // Fetch user first to check role
    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('id, role')
      .eq('id', req.params.id)
      .maybeSingle();

    if (fetchError || !user) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ success: false, message: 'Cannot delete admin accounts' });
    }

    const { error: deleteError } = await supabase
      .from('users')
      .delete()
      .eq('id', req.params.id);

    if (deleteError) {
      return res.status(500).json({ success: false, message: deleteError.message });
    }

    res.json({ success: true, message: 'Customer deleted' });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/admin/customers/:id/block — Block/unblock a customer
router.put('/customers/:id/block', async (req, res) => {
  try {
    // Fetch current is_blocked value
    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('id, is_blocked')
      .eq('id', req.params.id)
      .maybeSingle();

    if (fetchError || !user) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    const newBlockedState = !user.is_blocked;

    const { error: updateError } = await supabase
      .from('users')
      .update({ is_blocked: newBlockedState })
      .eq('id', req.params.id);

    if (updateError) {
      return res.status(500).json({ success: false, message: updateError.message });
    }

    res.json({
      success: true,
      message: `Customer ${newBlockedState ? 'blocked' : 'unblocked'}`,
      data: { isBlocked: newBlockedState }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
