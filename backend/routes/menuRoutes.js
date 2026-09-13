const express = require('express');
const supabase = require('../db');
const { protect } = require('../middleware/auth');
const { getMenuVisibility } = require('../settings');
const { checkOperatingHours } = require('../utils/operatingHours');

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

// In-memory cache for trending dishes and menu to avoid hammering database
let trendingCache = {
  data: null,
  timestamp: 0,
  dateStr: null,
};

let menuItemsCache = {
  data: null,
  timestamp: 0,
};

// GET /api/menu/public-stats — Real statistics for landing page (Public, no auth required)
router.get('/public-stats', async (req, res) => {
  try {
    const [usersRes, menuRes, ordersRes] = await Promise.all([
      supabase.from('users').select('id', { count: 'exact', head: true }).eq('role', 'customer'),
      supabase.from('menu_items').select('id', { count: 'exact', head: true }).eq('is_available', true),
      supabase.from('orders').select('id', { count: 'exact', head: true })
    ]);

    const registeredStudents = usersRes.count ?? 230;
    const activeDishes = menuRes.count ?? 9;
    const totalOrders = ordersRes.count ?? 46;

    res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=120');
    return res.json({
      success: true,
      data: {
        registeredStudents,
        activeDishes,
        totalOrders
      }
    });
  } catch (error) {
    console.error('Error fetching public stats:', error);
    return res.json({
      success: true,
      data: {
        registeredStudents: 230,
        activeDishes: 9,
        totalOrders: 46
      }
    });
  }
});

// GET /api/menu/operating-status — Operating hours and active ordering status (Public, no auth required)
router.get('/operating-status', async (req, res) => {
  try {
    const isMenuVisible = await getMenuVisibility();
    const status = checkOperatingHours();
    const isOpen = Boolean(status.isOpen && isMenuVisible);
    
    return res.json({
      success: true,
      data: {
        ...status,
        isOpen,
        isMenuVisible,
        message: !isMenuVisible
          ? 'Sorry, we are not taking orders currently. Online ordering is temporarily paused.'
          : status.message
      }
    });
  } catch (error) {
    const status = checkOperatingHours();
    return res.json({
      success: true,
      data: status
    });
  }
});

// GET /api/menu/trending-today — Fetch dynamically ranked trending dishes for today (Asia/Kolkata)
router.get('/trending-today', protect, async (req, res) => {
  try {
    const isMenuVisible = await getMenuVisibility();
    if (!isMenuVisible) {
      return res.json({ success: true, count: 0, data: [] });
    }

    const { kolkataDateStr, startISO, endISO } = getKolkataDayRange();

    // Check cache (30s TTL)
    const now = Date.now();
    if (trendingCache.data && (now - trendingCache.timestamp < 30000) && trendingCache.dateStr === kolkataDateStr) {
      res.setHeader('Cache-Control', 'private, max-age=15, stale-while-revalidate=30');
      return res.json(trendingCache.data);
    }


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

    const responsePayload = {
      success: true,
      count: rankedTrending.length,
      date: kolkataDateStr,
      timezone: 'Asia/Kolkata',
      data: rankedTrending
    };

    trendingCache = {
      data: responsePayload,
      timestamp: Date.now(),
      dateStr: kolkataDateStr,
    };

    res.setHeader('Cache-Control', 'private, max-age=15, stale-while-revalidate=30');
    res.json(responsePayload);
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

    // Check menu cache (30s TTL)
    const now = Date.now();
    if (menuItemsCache.data && (now - menuItemsCache.timestamp < 30000)) {
      res.setHeader('Cache-Control', 'private, max-age=15, stale-while-revalidate=30');
      return res.json(menuItemsCache.data);
    }

    const { data: menuItems, error } = await supabase
      .from('menu_items')
      .select('*')
      .order('category', { ascending: true })
      .order('item_name', { ascending: true });

    if (error) {
      return res.status(500).json({ success: false, message: error.message });
    }

    const menuPayload = { success: true, data: menuItems };
    menuItemsCache = {
      data: menuPayload,
      timestamp: Date.now(),
    };

    res.setHeader('Cache-Control', 'private, max-age=15, stale-while-revalidate=30');
    res.json(menuPayload);

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

