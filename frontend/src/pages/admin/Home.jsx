import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'motion/react';
import { ShoppingBag, DollarSign, Clock, CheckCircle, ChefHat, Flame, PieChart, TrendingUp, Award } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import StatCard from '../../components/ui/StatCard';
import LoadingState from '../../components/ui/LoadingState';

const CATEGORY_COLORS = ['#f97316', '#3b82f6', '#10b981', '#a855f7', '#ec4899', '#eab308', '#06b6d4'];

const AdminHome = () => {
  const [stats, setStats] = useState({ totalOrders: 0, totalRevenue: 0, pendingOrders: 0, preparingOrders: 0, completedOrders: 0 });
  const [topItems, setTopItems] = useState([]);
  const [categoryBreakdown, setCategoryBreakdown] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllStats();
  }, []);

  const fetchAllStats = async () => {
    try {
      const [ordersRes, revenueRes, menuRes] = await Promise.all([
        axios.get(`/admin/orders`),
        axios.get(`/admin/revenue`),
        axios.get(`/admin/menu`).catch(() => ({ data: { data: [] } }))
      ]);

      const orders = ordersRes.data.data || [];
      const menuList = menuRes.data?.data || [];
      
      // Build menu category lookup map
      const menuCatMap = {};
      menuList.forEach(m => {
        menuCatMap[m.item_name] = m.category || 'General';
      });

      const activeOrders = orders.filter(o => o.status !== 'Cancelled');
      const pending = orders.filter(o => o.status === 'Pending').length;
      const preparing = orders.filter(o => o.status === 'Preparing').length;
      const completed = orders.filter(o => o.status === 'Completed').length;

      // Item & Category Aggregation
      const itemMap = {};
      const catRevenueMap = {};
      let grandCatRevenue = 0;

      orders.forEach(order => {
        if (order.status !== 'Preparing' && order.status !== 'Completed') return;
        (order.order_items || []).forEach(item => {
          const name = item.item_name;
          const cat = menuCatMap[name] || item.category || 'General';
          const itemTotal = Number(item.price) * item.quantity;

          if (!itemMap[name]) {
            itemMap[name] = { name, quantity: 0, revenue: 0, category: cat };
          }
          itemMap[name].quantity += item.quantity;
          itemMap[name].revenue += itemTotal;

          catRevenueMap[cat] = (catRevenueMap[cat] || 0) + itemTotal;
          grandCatRevenue += itemTotal;
        });
      });

      const sortedTop = Object.values(itemMap)
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 5);

      const catList = Object.entries(catRevenueMap).map(([name, amount], idx) => ({
        name,
        amount,
        percent: grandCatRevenue > 0 ? Math.round((amount / grandCatRevenue) * 100) : 0,
        color: CATEGORY_COLORS[idx % CATEGORY_COLORS.length]
      })).sort((a, b) => b.amount - a.amount);

      setStats({
        totalOrders: activeOrders.length,
        totalRevenue: revenueRes.data.data.totalRevenue,
        pendingOrders: pending,
        preparingOrders: preparing,
        completedOrders: completed
      });

      setTopItems(sortedTop);
      setCategoryBreakdown(catList);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingState variant="stats" />;
  }

  const maxUnits = Math.max(1, ...(topItems.map(i => i.quantity)));

  const statItems = [
    { icon: ShoppingBag, value: stats.totalOrders, label: 'Total Orders', color: 'orange' },
    { icon: DollarSign, value: `₹${stats.totalRevenue}`, label: 'Total Revenue', color: 'green' },
    { icon: Clock, value: stats.pendingOrders, label: 'Pending Orders', color: 'orange' },
    { icon: ChefHat, value: stats.preparingOrders, label: 'Preparing Orders', color: 'blue' },
    { icon: CheckCircle, value: stats.completedOrders, label: 'Completed Orders', color: 'green' },
  ];

  return (
    <div className="admin-dashboard">
      <PageHeader title="Admin Dashboard" subtitle="Overview of all canteen activity and sales insights" />

      <div className="stats-grid">
        {statItems.map((stat, index) => (
          <StatCard key={stat.label} {...stat} index={index} />
        ))}
      </div>

      {/* Visual Insights & Analytics Section */}
      <div className="analytics-grid">
        {/* Top 5 Selling Items Leaderboard */}
        <div className="leaderboard-card">
          <div className="leaderboard-header">
            <div className="leaderboard-title">
              <Flame size={22} style={{ color: '#f97316' }} />
              Top 5 Selling Items
            </div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>By Order Volume</span>
          </div>

          {topItems.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem 0' }}>No sales data recorded yet.</p>
          ) : (
            <div>
              {topItems.map((item, idx) => {
                const percent = Math.round((item.quantity / maxUnits) * 100);
                const rankClass = idx === 0 ? 'rank-1' : idx === 1 ? 'rank-2' : idx === 2 ? 'rank-3' : 'rank-other';
                return (
                  <motion.div
                    key={item.name}
                    className="top-item-row"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.08 }}
                  >
                    <div className="top-item-row-top">
                      <div className="top-item-info">
                        <span className={`rank-medal ${rankClass}`}>
                          {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                        </span>
                        <div>
                          <div className="top-item-name">{item.name}</div>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.category}</span>
                        </div>
                      </div>
                      <div className="top-item-stats">
                        <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{item.quantity} units</span>
                        <span style={{ color: 'var(--success)', fontWeight: 700 }}>₹{item.revenue}</span>
                      </div>
                    </div>

                    <div className="item-progress-track" title={`${percent}% relative volume`}>
                      <div className="item-progress-fill" style={{ width: `${percent}%` }} />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Category Revenue Breakdown Bar Graph */}
        <div className="leaderboard-card">
          <div className="leaderboard-header">
            <div className="leaderboard-title">
              <PieChart size={22} style={{ color: '#3b82f6' }} />
              Category Revenue Share
            </div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Income Distribution</span>
          </div>

          {categoryBreakdown.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem 0' }}>No revenue data recorded yet.</p>
          ) : (
            <div>
              {/* Multi-segment progress bar */}
              <div className="category-segmented-bar" title="Category Revenue Share">
                {categoryBreakdown.map(cat => (
                  <div
                    key={cat.name}
                    className="category-segment"
                    style={{ width: `${Math.max(5, cat.percent)}%`, backgroundColor: cat.color }}
                    title={`${cat.name}: ₹${cat.amount} (${cat.percent}%)`}
                  />
                ))}
              </div>

              {/* Category Legend List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginTop: '1.25rem' }}>
                {categoryBreakdown.map(cat => (
                  <div key={cat.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <span style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: cat.color, display: 'inline-block' }} />
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{cat.name}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                      <span style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>{cat.percent}%</span>
                      <span style={{ fontWeight: 700, color: 'var(--success)', minWidth: '60px', textAlign: 'right' }}>₹{cat.amount}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminHome;
