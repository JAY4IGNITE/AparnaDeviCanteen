const express = require('express');
const supabase = require('../db');
const { protect } = require('../middleware/auth');
const { getMenuVisibility } = require('../settings');

const router = express.Router();

// Helper to compute India (Asia/Kolkata) calendar day boundaries in UTC ISO strings
const getKolkataDayRange = () => {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  const kolkataDateStr = formatter.format(new Date()); // YYYY-MM-DD
  const startISO = new Date(`${kolkataDateStr}T00:00:00.000+05:30`).toISOString();
  const endISO = new Date(`${kolkataDateStr}T23:59:59.999+05:30`).toISOString();

  return { kolkataDateStr, startISO, endISO };
};

// GET /api/menu/trending-today — Fetch dynamically ranked trending dishes for today (Asia/Kolkata)
router.get('/trending-today', protect, async (req, res) => {
  try {
    const isMenuVisible = await getMenuVisibility();
    if (!isMenuVisible) {
      return res.json({ success: true, count: 0, data: [] });
    }

    const { kolkataDateStr, startISO, endISO } = getKolkataDayRange();

    // 1. Fetch valid orders placed today (Asia/Kolkata)
    // Valid statuses: Pending, Preparing, Completed. Strictly exclude Cancelled.
    const { data: todayOrders, error: ordersError } = await supabase
      .from('orders')
      .select(`
        id,
        status,
        created_at,
        order_items (
          menu_item_id,
          item_name,
          quantity,
          price
        )
      `)
      .gte('created_at', startISO)
      .lte('created_at', endISO)
      .in('status', ['Pending', 'Preparing', 'Completed']);

    if (ordersError) {
      console.error('Error fetching today orders for trending:', ordersError.message);
      return res.status(500).json({ success: false, message: 'Failed to calculate trending dishes' });
    }

    // 2. Aggregate quantities by dish
    const quantityMap = new Map();

    for (const order of todayOrders || []) {
      for (const item of order.order_items || []) {
        const key = item.menu_item_id || item.item_name;
        const current = quantityMap.get(key) || {
          menu_item_id: item.menu_item_id,
          item_name: item.item_name,
          orders_today: 0,
          price: item.price
        };
        current.orders_today += Math.max(1, parseInt(item.quantity, 10) || 1);
        quantityMap.set(key, current);
      }
    }

    // If zero orders placed today, return empty list gracefully (zero-order fallback)
    if (quantityMap.size === 0) {
      return res.json({
        success: true,
        count: 0,
        date: kolkataDateStr,
        timezone: 'Asia/Kolkata',
        data: []
      });
    }

    // 3. Fetch active menu items to hydrate full product details
    const { data: allMenuItems, error: menuError } = await supabase
      .from('menu_items')
      .select('*');

    if (menuError) {
      console.error('Error fetching menu items for trending:', menuError.message);
      return res.status(500).json({ success: false, message: 'Failed to load menu details' });
    }

    const menuMapById = new Map((allMenuItems || []).map(m => [m.id, m]));
    const menuMapByName = new Map((allMenuItems || []).map(m => [m.item_name.toLowerCase().trim(), m]));

    // 4. Sort aggregated dishes descending by portions ordered today
    const sorted = Array.from(quantityMap.values())
      .sort((a, b) => b.orders_today - a.orders_today);

    // 5. Match with menu details and limit to top 6
    const rankedTrending = [];
    let rank = 1;

    for (const agg of sorted) {
      const menuItem = (agg.menu_item_id && menuMapById.get(agg.menu_item_id)) ||
        menuMapByName.get((agg.item_name || '').toLowerCase().trim());

      // Only include dishes that exist in the active menu
      if (menuItem) {
        rankedTrending.push({
          id: menuItem.id,
          item_name: menuItem.item_name,
          category: menuItem.category || 'General',
          price: menuItem.price,
          image_url: menuItem.image_url,
          is_veg: menuItem.is_veg,
          is_available: menuItem.is_available,
          orders_today: agg.orders_today,
          rank
        });
        rank += 1;
        if (rankedTrending.length >= 6) break;
      }
    }

    res.json({
      success: true,
      count: rankedTrending.length,
      date: kolkataDateStr,
      timezone: 'Asia/Kolkata',
      data: rankedTrending
    });
  } catch (error) {
    console.error('Trending calculation error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/menu — Fetch all available menu items
router.get('/', protect, async (req, res) => {
  try {
    const isMenuVisible = await getMenuVisibility();
    if (!isMenuVisible) {
      return res.json({ success: true, data: [] });
    }

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

module.exports = router;

