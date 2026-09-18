import { useState, useEffect, useRef, useMemo } from 'react';
import axios from 'axios';
import { Plus, Minus, ShoppingBag, BarChart3, TrendingUp, CheckCircle, AlertCircle, UtensilsCrossed, Search, X, Zap } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import AlertBanner from '../../components/ui/AlertBanner';
import LoadingState from '../../components/ui/LoadingState';
import MotionButton from '../../components/ui/MotionButton';

const CounterSale = () => {
  const [menu, setMenu] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [quantities, setQuantities] = useState({});
  const [stats, setStats] = useState({ items: [], grandTotalRevenue: 0 });
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const searchInputRef = useRef(null);

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

  const categories = useMemo(() => {
    return Array.from(new Set(menu.map(item => item.category || 'General')))
      .sort((a, b) => {
        const isStarterA = a.toLowerCase().includes('starter') || a.toLowerCase().includes('starer');
        const isStarterB = b.toLowerCase().includes('starter') || b.toLowerCase().includes('starer');
        if (isStarterA && !isStarterB) return -1;
        if (!isStarterA && isStarterB) return 1;
        return a.localeCompare(b);
      });
  }, [menu]);

  const categoryNames = useMemo(() => ['All', ...categories], [categories]);

  // Filter menu by category AND search query
  const filteredMenu = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return menu.filter(item => {
      const matchesCategory = selectedCategory === 'All' || (item.category || 'General') === selectedCategory;
      const matchesSearch = !q ||
        item.item_name.toLowerCase().includes(q) ||
        (item.category || '').toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [menu, selectedCategory, searchQuery]);

  // Reset keyboard selected index when filter changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [searchQuery, selectedCategory]);

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
  const cartItems = useMemo(() => {
    return menu
      .filter(item => (quantities[item.id] || 0) > 0)
      .map(item => ({
        id: item.id,
        name: item.item_name,
        price: Number(item.price),
        quantity: quantities[item.id],
        totalPrice: Number(item.price) * quantities[item.id]
      }));
  }, [menu, quantities]);

  const cartTotal = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.totalPrice, 0);
  }, [cartItems]);

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
        setSearchQuery('');
        
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

  // Keyboard Shortcuts Handler
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl+K or '/' -> Focus Search
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
        return;
      }

      if (e.key === '/' && document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        searchInputRef.current?.focus();
        return;
      }

      // Ctrl+Enter -> Confirm & Complete Sale
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        if (cartItems.length > 0 && !confirming) {
          handleConfirmSale();
        }
        return;
      }

      // Escape -> Clear search / Blur
      if (e.key === 'Escape') {
        setSearchQuery('');
        searchInputRef.current?.blur();
        return;
      }

      // Arrow Navigation in Search Results
      if (filteredMenu.length > 0) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setSelectedIndex(prev => Math.min(prev + 1, filteredMenu.length - 1));
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          setSelectedIndex(prev => Math.max(prev - 1, 0));
        } else if (e.key === 'Enter' && document.activeElement === searchInputRef.current) {
          e.preventDefault();
          const targetItem = filteredMenu[selectedIndex] || filteredMenu[0];
          if (targetItem) {
            handleIncrement(targetItem.id);
          }
        } else if (e.key === '+' || e.key === '=') {
          const targetItem = filteredMenu[selectedIndex] || filteredMenu[0];
          if (targetItem) {
            e.preventDefault();
            handleIncrement(targetItem.id);
          }
        } else if (e.key === '-') {
          const targetItem = filteredMenu[selectedIndex] || filteredMenu[0];
          if (targetItem) {
            e.preventDefault();
            handleDecrement(targetItem.id);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [filteredMenu, selectedIndex, cartItems, confirming]);

  const handleClearStats = async () => {
    if (!window.confirm('Are you sure you want to clear ALL counter sales statistics? This action is permanent and cannot be undone.')) return;
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
        subtitle="Record direct walk-in sales with high-speed POS shortcuts"
        showBack={true}
        backTo="/admin/home"
        actions={
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span 
              style={{ 
                fontSize: '0.75rem', 
                background: 'rgba(249, 115, 22, 0.15)', 
                color: 'var(--primary-400)', 
                padding: '0.3rem 0.65rem', 
                borderRadius: '6px', 
                border: '1px solid rgba(249, 115, 22, 0.3)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}
              title="Keyboard Shortcuts: Ctrl+K to search, Enter to add, Ctrl+Enter to complete sale"
            >
              <Zap size={14} /> High-Speed POS Active
            </span>
            <MotionButton
              type="button"
              className="btn btn-ghost"
              onClick={handleClearStats}
              style={{ color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.3)' }}
            >
              Clear Counter History
            </MotionButton>
          </div>
        }
      />

      <AlertBanner type={message.type} show={!!message.text}>
        {message.type === 'success' ? <CheckCircle size={16} style={{ marginRight: '0.5rem', display: 'inline' }} /> : <AlertCircle size={16} style={{ marginRight: '0.5rem', display: 'inline' }} />}
        {message.text}
      </AlertBanner>

      {/* Main Grid: Active Canteen Menu & Real-time Bill Checkout */}
      <div className="dashboard-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 290px), 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        
        {/* Left Side: Canteen Menu Selection */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary-400)', margin: 0 }}>
              Select Canteen Items
            </h2>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Mouse or Keyboard supported
            </span>
          </div>

          {/* Quick Search Input with Keyboard Badge */}
          <div style={{ position: 'relative', marginBottom: '1rem' }}>
            <input
              type="text"
              ref={searchInputRef}
              className="form-input"
              placeholder="Search dish (e.g. Biryani, Thums Up)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '2.5rem', paddingRight: '4.5rem', background: 'var(--bg-input)' }}
              id="pos-search-input"
            />
            <Search size={18} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            
            {searchQuery ? (
              <button 
                type="button" 
                onClick={() => setSearchQuery('')}
                style={{ position: 'absolute', right: '0.85rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                aria-label="Clear search"
              >
                <X size={16} />
              </button>
            ) : (
              <span 
                style={{ 
                  position: 'absolute', 
                  right: '0.75rem', 
                  top: '50%', 
                  transform: 'translateY(-50%)', 
                  fontSize: '0.7rem', 
                  fontFamily: 'monospace',
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-color)',
                  padding: '0.15rem 0.4rem',
                  borderRadius: '4px',
                  color: 'var(--text-muted)'
                }}
              >
                Ctrl + K
              </span>
            )}
          </div>

          {/* Quick Category Filter Bar */}
          {categories.length > 0 && (
            <div className="category-buttons-container" style={{ marginBottom: '1.25rem', paddingBottom: '0.25rem' }} role="tablist" aria-label="Counter sale categories">
              {categoryNames.map(cat => {
                const count = cat === 'All'
                  ? menu.length
                  : menu.filter(item => (item.category || 'General') === cat).length;
                return (
                  <MotionButton
                    key={cat}
                    type="button"
                    className={`category-btn ${selectedCategory === cat ? 'active' : ''}`}
                    onClick={() => setSelectedCategory(cat)}
                    whileTap={{ scale: 0.95 }}
                    id={`counter-cat-btn-${cat.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                  >
                    <span>{cat}</span>
                    <span className="category-btn-count">{count}</span>
                  </MotionButton>
                );
              })}
            </div>
          )}

          {filteredMenu.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', padding: '1rem 0' }}>No items found matching search or category.</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.75rem' }}>
              {filteredMenu.map((item, idx) => {
                const isSelected = idx === selectedIndex;
                const qty = quantities[item.id] || 0;
                return (
                  <div 
                    key={item.id} 
                    className="detail-row" 
                    onClick={() => setSelectedIndex(idx)}
                    style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center', 
                      padding: '0.75rem 1rem',
                      border: isSelected 
                        ? '1px solid var(--primary-400)' 
                        : qty > 0 
                        ? '1px solid var(--primary-500)' 
                        : '1px solid var(--border-color)',
                      background: isSelected 
                        ? 'rgba(249, 115, 22, 0.12)' 
                        : qty > 0 
                        ? 'rgba(249, 115, 22, 0.05)' 
                        : 'var(--bg-input)',
                      borderRadius: 'var(--radius-md)',
                      transition: 'all var(--transition-fast)',
                      flexWrap: 'wrap',
                      gap: '0.5rem',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: '160px' }}>
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.item_name}
                          className="menu-table-thumb"
                          style={{ width: 40, height: 40 }}
                          onError={(e) => {
                            e.target.style.display = 'none';
                            if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div
                        className="menu-table-thumb-placeholder"
                        style={{ display: item.image_url ? 'none' : 'flex', width: 40, height: 40 }}
                      >
                        <UtensilsCrossed size={16} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                          {item.item_name}
                          <span style={{ fontSize: '0.75rem', padding: '0.1rem 0.40rem', borderRadius: '4px', background: 'var(--bg-elevated)', color: 'var(--text-secondary)' }}>
                            {item.category}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--primary-400)', fontWeight: 500, marginTop: '0.15rem' }}>
                          ₹{item.price}
                        </div>
                      </div>
                    </div>

                    {/* Increment/Decrement Buttons */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <MotionButton 
                        type="button" 
                        className="btn btn-secondary btn-sm" 
                        onClick={(e) => { e.stopPropagation(); handleDecrement(item.id); }}
                        disabled={qty === 0}
                        style={{ padding: '0.35rem 0.65rem' }}
                        id={`counter-dec-${item.id}`}
                        aria-label={`Decrease ${item.item_name}`}
                      >
                        <Minus size={14} />
                      </MotionButton>
                      <span style={{ fontWeight: 700, minWidth: '24px', textAlign: 'center', fontSize: '1rem', color: qty > 0 ? 'var(--primary-400)' : 'inherit' }}>
                        {qty}
                      </span>
                      <MotionButton 
                        type="button" 
                        className="btn btn-primary btn-sm" 
                        onClick={(e) => { e.stopPropagation(); handleIncrement(item.id); }}
                        style={{ padding: '0.35rem 0.65rem' }}
                        id={`counter-inc-${item.id}`}
                        aria-label={`Increase ${item.item_name}`}
                      >
                        <Plus size={14} />
                      </MotionButton>
                    </div>
                  </div>
                );
              })}
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
                <p>No items selected. Use mouse or search to start billing.</p>
              </div>
            ) : (
              <div>
                <div className="table-wrapper" style={{ maxHeight: '280px', overflowY: 'auto', marginBottom: '1.5rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
                  <table className="table table-responsive-cards" style={{ margin: 0 }}>
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
                          <td data-label="Item" style={{ fontWeight: 500 }}>{item.name}</td>
                          <td data-label="Units" style={{ textAlign: 'center', fontWeight: 600 }}>{item.quantity}</td>
                          <td data-label="Price" style={{ textAlign: 'right', fontWeight: 600, color: 'var(--text-primary)' }}>₹{item.totalPrice}</td>
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
                  style={{ width: '100%', padding: '0.75rem 1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', fontWeight: 600, position: 'relative' }}
                  disabled={confirming}
                  id="confirm-counter-sale"
                >
                  {confirming ? (
                    <div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }}></div>
                  ) : (
                    <>
                      <span>Confirm Sale (₹{cartTotal})</span>
                      <span 
                        style={{ 
                          fontSize: '0.7rem', 
                          fontFamily: 'monospace',
                          background: 'rgba(0,0,0,0.25)',
                          padding: '0.15rem 0.4rem',
                          borderRadius: '4px',
                          marginLeft: 'auto'
                        }}
                      >
                        Ctrl + Enter
                      </span>
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
              <table className="table table-responsive-cards" style={{ margin: 0 }}>
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
                      <td data-label="Item Name" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{stat.itemName}</td>
                      <td data-label="Units Sold" style={{ textAlign: 'center', fontWeight: 600 }}>{stat.totalUnits} units</td>
                      <td data-label="Total Revenue" style={{ textAlign: 'right', fontWeight: 600, color: 'var(--success)' }}>₹{stat.totalRevenue}</td>
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
