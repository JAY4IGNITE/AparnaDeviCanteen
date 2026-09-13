import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'motion/react';
import { ShoppingCart, Plus, Minus, X, CheckCircle, AlertCircle, Package, UtensilsCrossed, ArrowLeft, Banknote, Search, Clock } from 'lucide-react';
import AnimatedModal from '../../components/ui/AnimatedModal';
import OrderingPausedModal from '../../components/OrderingPausedModal';
import AlertBanner from '../../components/ui/AlertBanner';
import EmptyState from '../../components/ui/EmptyState';
import LoadingState from '../../components/ui/LoadingState';
import MotionButton from '../../components/ui/MotionButton';
import { useCart } from '../../context/CartContext';
import { checkOperatingHours } from '../../lib/operatingHours';

const MenuPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { cart, addToCart, removeFromCart, clearCart, getCartCount, getCartTotal } = useCart();

  const [menuItems, setMenuItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(() => searchParams.get('category') || 'All');
  const [searchQuery, setSearchQuery] = useState(() => searchParams.get('q') || '');
  const [vegOnly, setVegOnly] = useState(false);
  const [showCart, setShowCart] = useState(() => searchParams.get('cart') === 'open');
  const [cartStep, setCartStep] = useState('cart'); // 'cart' or 'payment'
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [loading, setLoading] = useState(true);
  const [orderLoading, setOrderLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const operatingStatus = useMemo(() => checkOperatingHours(), []);
  const [serverOperatingStatus, setServerOperatingStatus] = useState(null);
  const [isPausedModalOpen, setIsPausedModalOpen] = useState(false);

  const activeStatus = serverOperatingStatus || operatingStatus;

  useEffect(() => {
    fetchMenu();
    fetchOperatingStatus();
  }, []);

  const fetchOperatingStatus = async () => {
    try {
      const res = await axios.get('/menu/operating-status');
      if (res.data?.success && res.data?.data) {
        setServerOperatingStatus(res.data.data);
        if (!res.data.data.isOpen) {
          setIsPausedModalOpen(true);
        }
      }
    } catch (err) {
      if (!operatingStatus.isOpen) {
        setIsPausedModalOpen(true);
      }
    }
  };

  // Update category and search if URL search params change
  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) setSelectedCategory(cat);
    const q = searchParams.get('q');
    if (q) setSearchQuery(q);
    if (searchParams.get('cart') === 'open') setShowCart(true);
  }, [searchParams]);

  const fetchMenu = async () => {
    try {
      const res = await axios.get('/menu');
      setMenuItems(res.data.data || []);
    } catch (err) {
      const detail = err.response?.data?.message || err.message || 'Unknown error';
      setMessage({ type: 'error', text: `Failed to load menu: ${detail}` });
    } finally {
      setLoading(false);
    }
  };

  const handleProceedToPayment = () => {
    if (!activeStatus.isOpen) {
      setIsPausedModalOpen(true);
      return;
    }
    setCartStep('payment');
  };

  const handleBackToCart = () => {
    setCartStep('cart');
  };

  const handleCloseCart = () => {
    setShowCart(false);
    setCartStep('cart');
  };

  const placeOrder = async () => {
    if (!activeStatus.isOpen) {
      setIsPausedModalOpen(true);
      return;
    }

    const items = Object.values(cart).map(item => ({
      menuItem: item.id,
      quantity: item.quantity
    }));

    if (items.length === 0) return;

    setOrderLoading(true);
    try {
      await axios.post('/orders', { items, payment_method: paymentMethod });
      clearCart();
      setShowCart(false);
      setCartStep('cart');
      setMessage({ type: 'success', text: 'Order placed successfully!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 4000);
    } catch (err) {
      if (err.response?.data?.isNotTakingOrders || !activeStatus.isOpen) {
        setIsPausedModalOpen(true);
      } else {
        setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to place order' });
      }
    } finally {
      setOrderLoading(false);
    }
  };

  const allCategories = useMemo(() => {
    return Array.from(new Set(menuItems.map(item => item.category || 'General'))).sort((a, b) => {
      const isStarterA = a.toLowerCase().includes('starter') || a.toLowerCase().includes('starer');
      const isStarterB = b.toLowerCase().includes('starter') || b.toLowerCase().includes('starer');
      if (isStarterA && !isStarterB) return -1;
      if (!isStarterA && isStarterB) return 1;
      return a.localeCompare(b);
    });
  }, [menuItems]);

  const categoryNames = useMemo(() => ['All', ...allCategories], [allCategories]);

  // Filter items by Search text and Veg Only preference (memoized)
  const filteredMenuItems = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return menuItems.filter(item => {
      const matchesVeg = !vegOnly || item.is_veg !== false;
      const matchesSearch = !q ||
        item.item_name.toLowerCase().includes(q) ||
        (item.category || '').toLowerCase().includes(q);
      return matchesVeg && matchesSearch;
    });
  }, [menuItems, vegOnly, searchQuery]);

  const categories = useMemo(() => {
    return Object.entries(
      filteredMenuItems.reduce((acc, item) => {
        const cat = item.category || 'General';
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(item);
        return acc;
      }, {})
    ).sort(([catA], [catB]) => {
      const isStarterA = catA.toLowerCase().includes('starter') || catA.toLowerCase().includes('starer');
      const isStarterB = catB.toLowerCase().includes('starter') || catB.toLowerCase().includes('starer');
      if (isStarterA && !isStarterB) return -1;
      if (!isStarterA && isStarterB) return 1;
      return catA.localeCompare(catB);
    });
  }, [filteredMenuItems]);

  const displayedCategories = useMemo(() => {
    return selectedCategory === 'All'
      ? categories
      : categories.filter(([cat]) => cat === selectedCategory);
  }, [categories, selectedCategory]);

  if (loading) {
    return <LoadingState />;
  }


  return (
    <div>
      {/* Clickable Operating Notice Banner when orders not taking */}
      {!activeStatus.isOpen && (
        <div 
          onClick={() => setIsPausedModalOpen(true)}
          style={{
            cursor: 'pointer',
            padding: '0.8rem 1.15rem',
            marginBottom: '1rem',
            borderRadius: '0.875rem',
            background: 'rgba(245, 158, 11, 0.12)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.75rem',
            color: '#fbbf24',
            transition: 'all 0.2s ease'
          }}
          title="Click to read ordering status details"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
            <Clock size={17} style={{ shrink: 0 }} />
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>
              Orders Currently Paused: {activeStatus.message || 'We are not taking orders currently.'}
            </span>
          </div>
          <span style={{ fontSize: '0.75rem', textDecoration: 'underline', opacity: 0.9, whiteSpace: 'nowrap' }}>
            View Details
          </span>
        </div>
      )}

      <AlertBanner type={message.type} show={!!message.text}>
        {message.type === 'success' ? <CheckCircle size={16} style={{ marginRight: '0.5rem', display: 'inline' }} /> : <AlertCircle size={16} style={{ marginRight: '0.5rem', display: 'inline' }} />}
        {message.text}
      </AlertBanner>

      {menuItems.length === 0 ? (
        <EmptyState icon={Package} title="No items available" description="Check back later for new menu items." />
      ) : (
        <>
          {/* Menu Page Header */}
          <div className="menu-page-header">
            <div className="menu-header-titles">
              <h1 className="menu-page-title">Menu</h1>
              <span className="menu-items-count-badge">
                {filteredMenuItems.length} {filteredMenuItems.length === 1 ? 'dish' : 'dishes'}
              </span>
            </div>
          </div>

          {/* Operating Hours Notice if Closed */}
          {!operatingStatus.isOpen && (
            <div className="operating-hours-closed-banner" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.85rem 1.15rem',
              marginBottom: '1.25rem',
              borderRadius: '1rem',
              background: 'rgba(245, 158, 11, 0.12)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              color: '#fbbf24',
              fontSize: '0.875rem',
              lineHeight: 1.4
            }}>
              <Clock size={20} style={{ flexShrink: 0, color: '#f59e0b' }} />
              <div>
                <strong style={{ fontWeight: 700, marginRight: '0.35rem' }}>Ordering Closed:</strong>
                <span>{operatingStatus.message}</span>
              </div>
            </div>
          )}

          {/* Search bar & Veg Only Quick Filter */}
          <div className="menu-toolbar">
            <div className="menu-search-wrap">
              <input
                type="text"
                className="menu-search-input"
                placeholder="Search dishes (e.g. Biryani, Paneer, Starters...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                id="menu-search-input"
              />
              <Search size={18} className="search-bar-icon" />
              {searchQuery && (
                <button type="button" className="search-bar-clear" onClick={() => setSearchQuery('')} aria-label="Clear search">
                  <X size={16} />
                </button>
              )}
            </div>

            <MotionButton
              type="button"
              className={`veg-toggle-btn ${vegOnly ? 'active' : ''}`}
              onClick={() => setVegOnly(!vegOnly)}
              whileTap={{ scale: 0.96 }}
              id="veg-only-toggle"
            >
              <span className="food-indicator veg">
                <span className="food-indicator-dot" />
              </span>
              <span>Veg Only</span>
            </MotionButton>
          </div>

          {/* Horizontal Category Filter Navigation */}
          <div className="category-buttons-container" role="tablist" aria-label="Menu categories">
            {categoryNames.map(cat => {
              const count = cat === 'All'
                ? filteredMenuItems.length
                : filteredMenuItems.filter(item => (item.category || 'General') === cat).length;
              return (
                <MotionButton
                  key={cat}
                  type="button"
                  className={`category-btn ${selectedCategory === cat ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(cat)}
                  whileTap={{ scale: 0.96 }}
                  id={`cat-btn-${cat.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                >
                  <span>{cat}</span>
                  <span className="category-btn-count">{count}</span>
                </MotionButton>
              );
            })}
          </div>

          <div className="menu-categories">
            {displayedCategories.length === 0 ? (
              <EmptyState
                icon={Search}
                title="No matching dishes found"
                description={
                  searchQuery
                    ? `No dishes found matching "${searchQuery}". Try a different search term or clear filters.`
                    : vegOnly
                    ? 'No vegetarian dishes found in this category.'
                    : 'No dishes currently available in this category.'
                }
              />
            ) : (
              displayedCategories.map(([category, items]) => (
              <div key={category} className="menu-category-section">
                <div className="category-header-wrap">
                  <h2 className="category-title">
                    {category}
                    <span className="category-title-badge">
                      {items.length} {items.length === 1 ? 'dish' : 'dishes'}
                    </span>
                  </h2>
                </div>

                <div className="menu-grid">
                  {items.map((item) => {
                    const isOutOfStock = !item.is_available;
                    const isVeg = item.is_veg !== false;
                    return (
                      <div
                        key={item.id}
                        className={`menu-card ${isOutOfStock ? 'out-of-stock' : ''}`}
                      >
                        <div className="menu-card-img-wrap">
                          <div className="menu-card-badge-wrap">
                            <span
                              className={`food-indicator ${isVeg ? 'veg' : 'non-veg'}`}
                              title={isVeg ? 'Veg' : 'Non-Veg'}
                            >
                              <span className="food-indicator-dot" />
                            </span>
                            <span className="food-indicator-text">{isVeg ? 'Veg' : 'Non-Veg'}</span>
                          </div>

                          {isOutOfStock && (
                            <div className="out-of-stock-overlay">
                              Out of Stock
                            </div>
                          )}

                          {item.image_url ? (
                            <img
                              src={item.image_url}
                              alt={item.item_name}
                              className="menu-card-img"
                              style={isOutOfStock ? { filter: 'grayscale(100%) brightness(0.6)' } : {}}
                              loading="lazy"
                              decoding="async"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                const placeholder = e.currentTarget.closest('.menu-card-img-wrap')?.querySelector('.menu-card-img-placeholder');
                                if (placeholder) placeholder.style.display = 'flex';
                              }}
                            />
                          ) : null}

                          <div
                            className="menu-card-img-placeholder"
                            style={{
                              display: item.image_url ? 'none' : 'flex',
                              ...(isOutOfStock ? { filter: 'grayscale(100%) brightness(0.6)' } : {})
                            }}
                          >
                            <div className="placeholder-icon-circle">
                              <UtensilsCrossed size={26} />
                            </div>
                          </div>
                        </div>

                        <div className="menu-card-body">
                          <div className="menu-card-info">
                            <h3
                              className="menu-item-name"
                              style={isOutOfStock ? { color: 'var(--text-muted)' } : {}}
                              title={item.item_name}
                            >
                              {item.item_name}
                            </h3>
                          </div>

                          <div className="menu-card-footer">
                            <div
                              className="menu-item-price"
                              style={isOutOfStock ? { opacity: 0.5, color: 'var(--text-muted)' } : {}}
                            >
                              <span className="price-currency">₹</span>
                              <span className="price-value">{item.price}</span>
                            </div>

                            <div className="menu-card-actions">
                              {isOutOfStock ? (
                                <span className="btn-out-of-stock-badge">
                                  Sold Out
                                </span>
                              ) : cart[item.id] ? (
                                <div className="menu-stepper">
                                  <MotionButton
                                    className="menu-stepper-btn"
                                    onClick={() => removeFromCart(item.id)}
                                    id={`decrease-${item.id}`}
                                    aria-label={`Remove one ${item.item_name}`}
                                    whileTap={{ scale: 0.9 }}
                                  >
                                    <Minus size={13} />
                                  </MotionButton>
                                  <span className="menu-stepper-qty">{cart[item.id].quantity}</span>
                                  <MotionButton
                                    className="menu-stepper-btn"
                                    onClick={() => addToCart(item)}
                                    id={`increase-${item.id}`}
                                    aria-label={`Add one more ${item.item_name}`}
                                    whileTap={{ scale: 0.9 }}
                                  >
                                    <Plus size={13} />
                                  </MotionButton>
                                </div>
                              ) : (
                                <MotionButton
                                  className="menu-add-btn"
                                  onClick={() => addToCart(item)}
                                  id={`add-${item.id}`}
                                  whileTap={{ scale: 0.95 }}
                                >
                                  <Plus size={14} />
                                  <span>Add</span>
                                </MotionButton>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )))}
          </div>
        </>
      )}

      {getCartCount() > 0 && (
        <motion.div
          className="cart-float"
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20 }}
        >
          <MotionButton className="cart-btn" onClick={() => setShowCart(true)} id="open-cart">
            <ShoppingCart size={22} />
            View Cart
            <span className="cart-badge">{getCartCount()}</span>
          </MotionButton>
        </motion.div>
      )}

      <AnimatedModal open={showCart} onClose={handleCloseCart}>
        {cartStep === 'cart' ? (
          <>
            <div className="modal-header">
              <h3>Your Cart</h3>
              <button className="btn btn-ghost" onClick={handleCloseCart} id="close-cart" aria-label="Close cart">
                <X size={22} />
              </button>
            </div>

            <div className="modal-body">
              {Object.values(cart).length === 0 ? (
                <EmptyState icon={ShoppingCart} description="Your cart is empty" />
              ) : (
                <>
                  {Object.values(cart).map(item => (
                    <div className="cart-item" key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.item_name}
                          className="menu-table-thumb"
                          style={{ width: 42, height: 42 }}
                          onError={(e) => {
                            e.target.style.display = 'none';
                            if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div
                        className="menu-table-thumb-placeholder"
                        style={{ display: item.image_url ? 'none' : 'flex', width: 42, height: 42 }}
                      >
                        <UtensilsCrossed size={18} />
                      </div>
                      <div className="cart-item-info" style={{ flex: 1 }}>
                        <h4>{item.item_name}</h4>
                        <p>₹{item.price} × {item.quantity}</p>
                      </div>
                      <div className="quantity-control">
                        <MotionButton className="quantity-btn" onClick={() => removeFromCart(item.id)} aria-label={`Remove one ${item.item_name}`}>
                          <Minus size={14} />
                        </MotionButton>
                        <span className="quantity-value">{item.quantity}</span>
                        <MotionButton className="quantity-btn" onClick={() => addToCart(item)} aria-label={`Add one more ${item.item_name}`}>
                          <Plus size={14} />
                        </MotionButton>
                      </div>
                    </div>
                  ))}

                  <div className="cart-total">
                    <span className="cart-total-label">Total</span>
                    <span className="cart-total-value">₹{getCartTotal()}</span>
                  </div>
                </>
              )}
            </div>

            {Object.values(cart).length > 0 && (
              <div className="modal-footer">
                <MotionButton className="btn btn-secondary" onClick={clearCart} id="clear-cart">
                  Clear Cart
                </MotionButton>
                {operatingStatus.isOpen ? (
                  <MotionButton className="btn btn-primary" onClick={handleProceedToPayment} id="proceed-to-payment">
                    Place Order
                  </MotionButton>
                ) : (
                  <MotionButton
                    className="btn btn-primary"
                    disabled
                    style={{ opacity: 0.6, cursor: 'not-allowed' }}
                    id="proceed-to-payment"
                    title={operatingStatus.message}
                  >
                    Closed (Sundays Only)
                  </MotionButton>
                )}
              </div>
            )}
          </>
        ) : (
          <>
            <div className="modal-header">
              <h3>Payment Method</h3>
              <button className="btn btn-ghost" onClick={handleCloseCart} id="close-payment" aria-label="Close">
                <X size={22} />
              </button>
            </div>

            <div className="modal-body">
              <div className="payment-step-summary">
                <div className="payment-step-summary-row">
                  <span>Items</span>
                  <span>{getCartCount()}</span>
                </div>
                <div className="payment-step-summary-row payment-step-summary-total">
                  <span>Total Amount</span>
                  <span>₹{getCartTotal()}</span>
                </div>
              </div>

              <div className="payment-method-section">
                <label className="payment-method-label">Select Payment Method</label>
                <div className="payment-method-options">
                  <label
                    className={`payment-method-option ${paymentMethod === 'COD' ? 'selected' : ''}`}
                    htmlFor="payment-cod"
                  >
                    <input
                      type="radio"
                      id="payment-cod"
                      name="paymentMethod"
                      value="COD"
                      checked={paymentMethod === 'COD'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="payment-method-radio"
                    />
                    <div className="payment-method-icon">
                      <Banknote size={22} />
                    </div>
                    <div className="payment-method-details">
                      <span className="payment-method-name">Cash On Delivery</span>
                      <span className="payment-method-desc">Pay when you receive your order</span>
                    </div>
                    <div className="payment-method-check">
                      {paymentMethod === 'COD' && <CheckCircle size={18} />}
                    </div>
                  </label>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <MotionButton className="btn btn-secondary" onClick={handleBackToCart} id="back-to-cart">
                <ArrowLeft size={16} /> Back
              </MotionButton>
              <MotionButton
                className="btn btn-primary"
                onClick={placeOrder}
                disabled={orderLoading || !activeStatus.isOpen}
                id="confirm-order"
              >
                {orderLoading ? (
                  <div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
                ) : !activeStatus.isOpen ? (
                  'Orders Paused'
                ) : (
                  'Confirm Order'
                )}
              </MotionButton>
            </div>
          </>
        )}
      </AnimatedModal>

      {/* Professional "Not Taking Orders" Customer Modal */}
      <OrderingPausedModal
        open={isPausedModalOpen}
        onClose={() => setIsPausedModalOpen(false)}
        customMessage={activeStatus?.message}
        operatingHoursText={activeStatus?.operatingHoursText}
        onExploreMenu={() => setIsPausedModalOpen(false)}
        onBackHome={() => navigate('/customer/home')}
      />
    </div>
  );
};

export default MenuPage;
