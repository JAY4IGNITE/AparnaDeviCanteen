import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Minus, ShoppingBag, BarChart3, TrendingUp, CheckCircle, AlertCircle } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import AlertBanner from '../../components/ui/AlertBanner';
import LoadingState from '../../components/ui/LoadingState';
import MotionButton from '../../components/ui/MotionButton';

const CounterSale = () => {
  const [menu, setMenu] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [stats, setStats] = useState({ items: [], grandTotalRevenue: 0 });
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchMenu();
    fetchStats();
  }, []);

  const fetchMenu = async () => {
    try {
      const res = await axios.get('/admin/menu');
      // Only show menu items that are marked as available
      const availableItems = (res.data.data || []).filter(item => item.is_available);
      setMenu(availableItems);
      
      // Initialize quantities
      const initialQuantities = {};
      availableItems.forEach(item => {
        initialQuantities[item.id] = 0;
      });
      setQuantities(initialQuantities);
    } catch (err) {
      console.error('Failed to fetch menu:', err);
      setMessage({ type: 'error', text: 'Failed to load menu items' });
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await axios.get('/admin/counter-sales/stats');
      if (res.data.success) {
        setStats(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch statistics:', err);
    } finally {
      setStatsLoading(false);
    }
  };

  const handleIncrement = (itemId) => {
    setQuantities(prev => ({
      ...prev,
      [itemId]: (prev[itemId] || 0) + 1
    }));
  };

  const handleDecrement = (itemId) => {
    setQuantities(prev => ({
      ...prev,
      [itemId]: Math.max(0, (prev[itemId] || 0) - 1)
    }));
  };

  // Calculate cart items in real-time
  const cartItems = menu
    .filter(item => (quantities[item.id] || 0) > 0)
    .map(item => ({
      id: item.id,
      name: item.item_name,
      price: Number(item.price),
      quantity: quantities[item.id],
      totalPrice: Number(item.price) * quantities[item.id]
    }));

  const cartTotal = cartItems.reduce((sum, item) => sum + item.totalPrice, 0);

  const handleConfirmSale = async () => {
    if (cartItems.length === 0) return;
    setConfirming(true);
    setMessage({ type: '', text: '' });
    try {
      const res = await axios.post('/admin/counter-sales', { items: cartItems });
      if (res.data.success) {
        setMessage({ type: 'success', text: 'Counter sale recorded successfully!' });
        
        // Reset cart quantities
        const resetQuantities = {};
        menu.forEach(item => {
          resetQuantities[item.id] = 0;
        });
        setQuantities(resetQuantities);
        
        // Refresh stats
        fetchStats();
        
        setTimeout(() => setMessage({ type: '', text: '' }), 4000);
      }
    } catch (err) {
      console.error('Failed to record sale:', err);
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to record counter sale' });
    } finally {
      setConfirming(false);
    }
  };

  const handleClearStats = async () => {
    if (!window.confirm('⚠️ Are you sure you want to clear ALL counter sales statistics? This action is permanent and cannot be undone.')) return;
    try {
      const res = await axios.delete('/admin/counter-sales');
      if (res.data.success) {
        setMessage({ type: 'success', text: 'Counter sale statistics cleared successfully!' });
        setStats({ items: [], grandTotalRevenue: 0 });
        setTimeout(() => setMessage({ type: '', text: '' }), 4000);
      }
    } catch (err) {
      console.error('Failed to clear statistics:', err);
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to clear statistics' });
    }
  };

  if (loading) {
    return <LoadingState />;
  }

  return (
    <div>
      <PageHeader
        title="Counter Sale"
        subtitle="Record direct walk-in sales and view real-time statistics"
        actions={
          <MotionButton
            type="button"
            className="btn btn-ghost"
            onClick={handleClearStats}
            style={{ color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.3)' }}
          >
            Clear Counter History
          </MotionButton>
        }
      />

      <AlertBanner type={message.type} show={!!message.text}>
        {message.type === 'success' ? <CheckCircle size={16} style={{ marginRight: '0.5rem', display: 'inline' }} /> : <AlertCircle size={16} style={{ marginRight: '0.5rem', display: 'inline' }} />}
        {message.text}
      </AlertBanner>

      {/* Main Grid: Active Canteen Menu & Real-time Bill Checkout */}
      <div className="dashboard-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        
        {/* Left Side: Canteen Menu Selection */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary-400)' }}>
            Select Canteen Items
          </h2>
          {menu.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>No items available on the menu.</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.75rem' }}>
              {menu.map(item => (
                <div 
                  key={item.id} 
                  className="detail-row" 
                  style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    padding: '0.75rem 1rem',
                    border: (quantities[item.id] || 0) > 0 ? '1px solid var(--primary-500)' : '1px solid var(--border-color)',
                    background: (quantities[item.id] || 0) > 0 ? 'rgba(249, 115, 22, 0.05)' : 'var(--bg-input)',
                    transition: 'all var(--transition-fast)'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {item.item_name}
                      <span style={{ fontSize: '0.75rem', padding: '0.1rem 0.40rem', borderRadius: '4px', background: 'var(--bg-elevated)', color: 'var(--text-secondary)' }}>
                        {item.category}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--primary-400)', fontWeight: 500, marginTop: '0.15rem' }}>
                      ₹{item.price}
                    </div>
                  </div>

                  {/* Quantity adjustment panel */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleDecrement(item.id)}
                      aria-label={`Remove one ${item.item_name}`}
                      style={{ padding: '0.35rem', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <Minus size={14} />
                    </button>
                    <span style={{ fontWeight: 700, minWidth: '20px', textAlign: 'center', fontSize: '1rem', color: 'var(--text-primary)' }}>
                      {quantities[item.id] || 0}
                    </span>
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={() => handleIncrement(item.id)}
                      aria-label={`Add one more ${item.item_name}`}
                      style={{ padding: '0.35rem', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Current active order checkout */}
        <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary-400)' }}>
            <ShoppingBag size={20} />
            Current Customer Billing
          </h2>
          
          <div style={{ flex: 1 }}>
            {cartItems.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '180px', color: 'var(--text-muted)' }}>
                <ShoppingBag size={42} style={{ opacity: 0.3, marginBottom: '0.75rem' }} />
                <p>No items selected. Adjust menu counts to start billing.</p>
              </div>
            ) : (
              <div>
                <div className="table-wrapper" style={{ maxHeight: '250px', overflowY: 'auto', marginBottom: '1.5rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
                  <table className="table" style={{ margin: 0 }}>
                    <thead>
                      <tr>
                        <th>Item</th>
                        <th style={{ textAlign: 'center' }}>Units</th>
                        <th style={{ textAlign: 'right' }}>Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cartItems.map(item => (
                        <tr key={item.id}>
                          <td style={{ fontWeight: 500 }}>{item.name}</td>
                          <td style={{ textAlign: 'center', fontWeight: 600 }}>{item.quantity}</td>
                          <td style={{ textAlign: 'right', fontWeight: 600, color: 'var(--text-primary)' }}>₹{item.totalPrice}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Bill Total and Confirm button */}
                <div style={{ background: 'var(--bg-input)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Total Bill Amount</span>
                    <span style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--primary-400)' }}>₹{cartTotal}</span>
                  </div>
                </div>

                <button 
                  type="button" 
                  className="btn btn-primary" 
                  onClick={handleConfirmSale}
                  style={{ width: '100%', padding: '0.75rem 1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}
                  disabled={confirming}
                >
                  {confirming ? (
                    <div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }}></div>
                  ) : (
                    <>
                      Confirm & Print Sale (₹{cartTotal})
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Historical statistics section */}
      <div className="card" style={{ padding: '1.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary-400)' }}>
          <BarChart3 size={20} />
          Counter Sales Statistics
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
          Historical record of direct canteen walk-in sales. Removed or modified menu items will still show counts here.
        </p>

        {statsLoading ? (
          <div className="loading-spinner" style={{ minHeight: '120px' }}><div className="spinner"></div></div>
        ) : stats.items.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem', color: 'var(--text-muted)' }}>
            <TrendingUp size={36} style={{ opacity: 0.3, marginBottom: '0.5rem' }} />
            <p>No counter sales have been recorded yet.</p>
          </div>
        ) : (
          <div>
            <div className="table-wrapper" style={{ marginBottom: '1.5rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
              <table className="table" style={{ margin: 0 }}>
                <thead>
                  <tr>
                    <th>Item Name</th>
                    <th style={{ textAlign: 'center' }}>Units Sold</th>
                    <th style={{ textAlign: 'right' }}>Total Price (Revenue)</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.items.map((stat, idx) => (
                    <tr key={idx}>
                      <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{stat.itemName}</td>
                      <td style={{ textAlign: 'center', fontWeight: 600 }}>{stat.totalUnits} units</td>
                      <td style={{ textAlign: 'right', fontWeight: 600, color: 'var(--success)' }}>₹{stat.totalRevenue}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Total cumulative revenue */}
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <div 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '1.5rem', 
                  background: 'rgba(34, 197, 94, 0.08)', 
                  border: '1px solid rgba(34, 197, 94, 0.2)', 
                  padding: '0.75rem 1.5rem', 
                  borderRadius: 'var(--radius-md)' 
                }}
              >
                <span style={{ fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  Total Counter Revenue
                </span>
                <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--success)' }}>
                  ₹{stats.grandTotalRevenue}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CounterSale;
