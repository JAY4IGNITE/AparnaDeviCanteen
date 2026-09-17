import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'motion/react';
import { 
  ShoppingBag, 
  DollarSign, 
  Clock, 
  CheckCircle, 
  ChefHat, 
  Flame, 
  PieChart, 
  RefreshCw, 
  Power, 
  MessageCircle, 
  Phone, 
  ArrowRight,
  Package
} from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import StatCard from '../../components/ui/StatCard';
import LoadingState from '../../components/ui/LoadingState';
import MotionButton from '../../components/ui/MotionButton';
import AlertBanner from '../../components/ui/AlertBanner';

const CATEGORY_COLORS = ['#f97316', '#3b82f6', '#10b981', '#a855f7', '#ec4899', '#eab308', '#06b6d4'];

const AdminHome = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ totalOrders: 0, totalRevenue: 0, pendingOrders: 0, preparingOrders: 0, completedOrders: 0 });
  const [recentOrders, setRecentOrders] = useState([]);
  const [topItems, setTopItems] = useState([]);
  const [categoryBreakdown, setCategoryBreakdown] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [menuVisible, setMenuVisible] = useState(true);
  const [togglingMenu, setTogglingMenu] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    fetchAllStats();
    fetchMenuVisibility();

    // 10s auto-sync polling for real-time dashboard data
    const interval = setInterval(() => {
      fetchAllStats(true);
    }, 10000);

    return () => {
      isMountedRef.current = false;
      clearInterval(interval);
    };
  }, []);

  const fetchMenuVisibility = async () => {
    try {
      const res = await axios.get('/admin/menu/visibility');
      if (isMountedRef.current && res.data?.isVisible !== undefined) {
        setMenuVisible(res.data.isVisible);
      }
    } catch (err) {
      console.error('Failed to load menu visibility:', err);
    }
  };

  const handleToggleMenuVisibility = async () => {
    setTogglingMenu(true);
    const nextVal = !menuVisible;
    try {
      await axios.put('/admin/menu/visibility', { isVisible: nextVal });
      setMenuVisible(nextVal);
      setMessage({
        type: 'success',
        text: `Online Ordering is now ${nextVal ? 'ACTIVE (Accepting Orders)' : 'PAUSED (Customers will see Not Taking Orders popup)'}`
      });
      setTimeout(() => {
        if (isMountedRef.current) setMessage({ type: '', text: '' });
      }, 4500);
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update ordering status' });
      setTimeout(() => {
        if (isMountedRef.current) setMessage({ type: '', text: '' });
      }, 4000);
    } finally {
      if (isMountedRef.current) setTogglingMenu(false);
    }
  };

  const fetchAllStats = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    if (isSilent) setRefreshing(true);
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

      if (isMountedRef.current) {
        setStats({
          totalOrders: activeOrders.length,
          totalRevenue: revenueRes.data?.data?.totalRevenue || 0,
          pendingOrders: pending,
          preparingOrders: preparing,
          completedOrders: completed
        });

        // Keep 5 latest orders sorted by time
        const sortedRecent = [...orders]
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .slice(0, 6);
        setRecentOrders(sortedRecent);

        setTopItems(sortedTop);
        setCategoryBreakdown(catList);
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    } finally {
      if (isMountedRef.current) {
        if (!isSilent) setLoading(false);
        setRefreshing(false);
      }
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await axios.put(`/admin/orders/${orderId}`, { status: newStatus });
      fetchAllStats(true);
    } catch (err) {
      console.error('Update failed:', err);
      toast.error('Failed to update status: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleWhatsAppNotify = (order) => {
    const rawPhone = order.customer?.phone;
    if (!rawPhone) {
      toast.error('No phone number available for this customer');
      return;
    }

    let cleaned = rawPhone.toString().replace(/\D/g, '');
    if (cleaned.length === 10) {
      cleaned = '91' + cleaned;
    }

    const customerName = order.customer?.name || 'Customer';
    const orderNum = order.order_number || (order.id ? order.id.substring(0, 6).toUpperCase() : 'ORDER');
    const totalAmount = order.total_amount || 0;
    
    let msgText = `*Order Update – AparnaCanteen*\n\nHello ${customerName}!\n\nUpdate regarding your *Order #${orderNum}*.\n*Total Amount:* ₹${totalAmount}\n\n— *AparnaCanteen*`;

    if (order.status === 'Preparing') {
      msgText = `*Order Update – AparnaCanteen*\n\nHello ${customerName}!\n\nYour *Order #${orderNum}* is now being *prepared in the kitchen*.\n*Total Amount:* ₹${totalAmount}\n\nWe will have your order ready and served to you shortly. Thank you for your patience!\n\n— *AparnaCanteen*`;
    } else if (order.status === 'Completed') {
      msgText = `*Order Completed – AparnaCanteen*\n\nHello ${customerName}!\n\nYour *Order #${orderNum}* has been *successfully completed*.\n\nThank you for ordering from *AparnaCanteen*! We hope you enjoyed your meal.\n\nWe look forward to serving you again!\n\n— *AparnaCanteen*`;
    }

    const encodedMsg = encodeURIComponent(msgText);
    const whatsappUrl = `https://wa.me/${cleaned}?text=${encodedMsg}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  if (loading) {
    return <LoadingState variant="stats" />;
  }

  const maxUnits = Math.max(1, ...(topItems.map(i => i.quantity)));

  const statItems = [
    { 
      icon: ShoppingBag, 
      value: stats.totalOrders, 
      label: 'Total Orders', 
      color: 'orange',
      onClick: () => navigate('/admin/orders')
    },
    { 
      icon: DollarSign, 
      value: `₹${stats.totalRevenue}`, 
      label: 'Total Revenue', 
      color: 'green',
      onClick: () => navigate('/admin/revenue')
    },
    { 
      icon: Clock, 
      value: stats.pendingOrders, 
      label: 'Pending Orders', 
      color: 'orange',
      onClick: () => navigate('/admin/orders?status=Pending')
    },
    { 
      icon: ChefHat, 
      value: stats.preparingOrders, 
      label: 'Preparing Orders', 
      color: 'blue',
      onClick: () => navigate('/admin/orders?status=Preparing')
    },
    { 
      icon: CheckCircle, 
      value: stats.completedOrders, 
      label: 'Completed Orders', 
      color: 'green',
      onClick: () => navigate('/admin/orders?status=Completed')
    },
  ];

  return (
    <div className="admin-dashboard">
      <PageHeader 
        title="Admin Dashboard" 
        subtitle="Overview of all canteen activity, live orders, and sales insights" 
        actions={
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
            {/* Master Canteen Menu Visibility Toggle */}
            <MotionButton
              type="button"
              className={`btn ${menuVisible ? 'btn-success' : 'btn-danger'}`}
              onClick={handleToggleMenuVisibility}
              disabled={togglingMenu}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
              title="Toggle online ordering status for customers"
            >
              <Power size={15} />
              <span>Orders: {menuVisible ? 'ACTIVE (Accepting)' : 'PAUSED (Closed)'}</span>
            </MotionButton>

            {/* Manual Refresh Button */}
            <MotionButton
              type="button"
              className="btn btn-ghost"
              onClick={() => fetchAllStats(true)}
              disabled={refreshing}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
              title="Refresh dashboard data now"
            >
              <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
              <span>{refreshing ? 'Syncing...' : 'Refresh'}</span>
            </MotionButton>
          </div>
        }
      />

      <AlertBanner type={message.type} show={!!message.text}>
        {message.text}
      </AlertBanner>


      {/* Interactive Stat Cards Grid with Deep-Linking */}
      <div className="stats-grid">
        {statItems.map((stat, index) => (
          <StatCard key={stat.label} {...stat} index={index} />
        ))}
      </div>

      {/* RECENT LIVE ORDERS MONITOR DIRECTLY ON DASHBOARD */}
      <div className="card" style={{ marginTop: '1.75rem', marginBottom: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.15rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
              <Clock size={20} style={{ color: 'var(--primary-400)' }} />
              Recent Incoming Orders
            </h2>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Real-time feed with instant order actions
            </span>
          </div>

          <MotionButton
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => navigate('/admin/orders')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: 'var(--primary-400)' }}
          >
            <span>View All Orders</span>
            <ArrowRight size={14} />
          </MotionButton>
        </div>

        {recentOrders.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Package size={32} style={{ margin: '0 auto 0.75rem', opacity: 0.5 }} />
            <p style={{ margin: 0 }}>No orders recorded yet today.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="table table-responsive-cards">
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Customer</th>
                  <th>Block</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td data-label="Order #" style={{ fontWeight: 700, fontFamily: 'monospace', color: 'var(--primary-400)' }}>
                      #{order.order_number || (order.id ? order.id.substring(0, 6).toUpperCase() : '')}
                    </td>
                    <td data-label="Customer" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      {order.customer?.name || 'Customer'}
                    </td>
                    <td data-label="Block">
                      {order.customer?.hostel_block || '—'}
                    </td>
                    <td data-label="Items" style={{ maxWidth: '240px' }}>
                      {(order.order_items || []).map(i => `${i.item_name}×${i.quantity}`).join(', ') || '—'}
                    </td>
                    <td data-label="Total" style={{ fontWeight: 700, color: 'var(--primary-400)' }}>
                      ₹{order.total_amount}
                    </td>
                    <td data-label="Status">
                      <span className={`badge badge-${(order.status || '').toLowerCase()}`}>
                        {order.status}
                      </span>
                    </td>
                    <td data-label="Actions">
                      <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                        {order.status === 'Pending' && (
                          <MotionButton
                            type="button"
                            className="btn btn-info btn-sm"
                            onClick={() => updateOrderStatus(order.id, 'Preparing')}
                            title="Start Preparing in Kitchen"
                            style={{ padding: '0.35rem 0.6rem' }}
                          >
                            <ChefHat size={14} />
                          </MotionButton>
                        )}
                        {(order.status === 'Pending' || order.status === 'Preparing') && (
                          <MotionButton
                            type="button"
                            className="btn btn-success btn-sm"
                            onClick={() => updateOrderStatus(order.id, 'Completed')}
                            title="Mark as Completed & Ready"
                            style={{ padding: '0.35rem 0.6rem' }}
                          >
                            <CheckCircle size={14} />
                          </MotionButton>
                        )}
                        {order.customer?.phone && (
                          <MotionButton
                            type="button"
                            className="btn btn-whatsapp btn-sm"
                            onClick={() => handleWhatsAppNotify(order)}
                            title="Notify Customer on WhatsApp"
                            style={{ padding: '0.35rem 0.6rem' }}
                          >
                            <MessageCircle size={14} />
                          </MotionButton>
                        )}
                        {order.customer?.phone && (
                          <a
                            href={`tel:${order.customer.phone}`}
                            className="btn btn-secondary btn-sm"
                            title={`Call ${order.customer?.name}`}
                            style={{ padding: '0.35rem 0.6rem', color: 'var(--success)' }}
                          >
                            <Phone size={14} />
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
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
                          #{idx + 1}
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
