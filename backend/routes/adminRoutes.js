const express = require('express');
const ExcelJS = require('exceljs');
const Menu = require('../models/Menu');
const Order = require('../models/Order');
const User = require('../models/User');
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

    const menuItem = await Menu.create({ itemName, price, category, isAvailable });
    res.status(201).json({ success: true, data: menuItem });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/admin/menu — Get all menu items (including unavailable)
router.get('/menu', async (req, res) => {
  try {
    const menuItems = await Menu.find().sort({ category: 1, itemName: 1 });
    res.json({ success: true, data: menuItems });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/admin/menu/:id — Edit a menu item
router.put('/menu/:id', async (req, res) => {
  try {
    const { itemName, price, category, isAvailable } = req.body;
    const menuItem = await Menu.findByIdAndUpdate(
      req.params.id,
      { itemName, price, category, isAvailable },
      { new: true, runValidators: true }
    );

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
    const menuItem = await Menu.findByIdAndDelete(req.params.id);
    if (!menuItem) {
      return res.status(404).json({ success: false, message: 'Menu item not found' });
    }
    res.json({ success: true, message: 'Menu item deleted' });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============== ORDER MANAGEMENT ==============

// GET /api/admin/orders — Get all orders with optional filters
router.get('/orders', async (req, res) => {
  try {
    const { date, status } = req.query;
    const filter = {};

    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      filter.createdAt = { $gte: startOfDay, $lte: endOfDay };
    }

    if (status) {
      filter.status = status;
    }

    const orders = await Order.find(filter)
      .populate('customer', 'name phone hostelBlock')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: orders });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/admin/orders/:id — Update order status
router.put('/orders/:id', async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('customer', 'name phone hostelBlock');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.json({ success: true, data: order });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/admin/orders/export — Export orders to Excel
router.get('/orders/export', async (req, res) => {
  try {
    const { date } = req.query;
    const filter = {};

    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      filter.createdAt = { $gte: startOfDay, $lte: endOfDay };
    }

    const orders = await Order.find(filter)
      .populate('customer', 'name phone hostelBlock')
      .sort({ createdAt: -1 });

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Orders');

    sheet.columns = [
      { header: 'Order ID', key: 'orderId', width: 28 },
      { header: 'Customer Name', key: 'customerName', width: 20 },
      { header: 'Phone', key: 'phone', width: 15 },
      { header: 'Hostel Block', key: 'hostelBlock', width: 15 },
      { header: 'Items', key: 'items', width: 40 },
      { header: 'Total Amount', key: 'totalAmount', width: 15 },
      { header: 'Status', key: 'status', width: 12 },
      { header: 'Date', key: 'date', width: 20 }
    ];

    // Style header row
    sheet.getRow(1).font = { bold: true };
    sheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' }
    };
    sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

    orders.forEach(order => {
      const itemsStr = order.items
        .map(i => `${i.itemName} x${i.quantity} (₹${i.price})`)
        .join(', ');

      sheet.addRow({
        orderId: order._id.toString(),
        customerName: order.customer?.name || 'N/A',
        phone: order.customer?.phone || 'N/A',
        hostelBlock: order.customer?.hostelBlock || 'N/A',
        items: itemsStr,
        totalAmount: order.totalAmount,
        status: order.status,
        date: order.createdAt.toLocaleString()
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

    const result = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfDay, $lte: endOfDay }
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' },
          orderCount: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        date,
        totalRevenue: result.length > 0 ? result[0].totalRevenue : 0,
        orderCount: result.length > 0 ? result[0].orderCount : 0
      }
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

    const result = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfDay, $lte: endOfDay }
        }
      },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.itemName',
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
        }
      },
      { $sort: { totalQuantity: -1 } }
    ]);

    res.json({ success: true, data: result });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============== CUSTOMER MANAGEMENT ==============

// GET /api/admin/customers — List all customers
router.get('/customers', async (req, res) => {
  try {
    const customers = await User.find({ role: 'customer' })
      .select('-password')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: customers });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/admin/customers/:id — Delete a customer
router.delete('/customers/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }
    if (user.role === 'admin') {
      return res.status(400).json({ success: false, message: 'Cannot delete admin accounts' });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Customer deleted' });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/admin/customers/:id/block — Block/unblock a customer
router.put('/customers/:id/block', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    user.isBlocked = !user.isBlocked;
    await user.save();

    res.json({
      success: true,
      message: `Customer ${user.isBlocked ? 'blocked' : 'unblocked'}`,
      data: { isBlocked: user.isBlocked }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
