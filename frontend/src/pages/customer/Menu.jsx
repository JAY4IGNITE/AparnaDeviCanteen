import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'motion/react';
import { ShoppingCart, Plus, Minus, X, CheckCircle, AlertCircle, Package, UtensilsCrossed, ArrowLeft, Banknote, Search, Sparkles } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import AnimatedModal from '../../components/ui/AnimatedModal';
import AlertBanner from '../../components/ui/AlertBanner';
import EmptyState from '../../components/ui/EmptyState';
import LoadingState from '../../components/ui/LoadingState';
import MotionButton from '../../components/ui/MotionButton';
import { staggerContainer, fadeUp } from '../../lib/motion';

const MenuPage = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [cart, setCart] = useState(() => {
    try {
      const savedCart = localStorage.getItem('foodnest_cart');
      return savedCart ? JSON.parse(savedCart) : {};
    } catch (e) {
      return {};
    }
  });
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [vegOnly, setVegOnly] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [cartStep, setCartStep] = useState('cart'); // 'cart' or 'payment'
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [loading, setLoading] = useState(true);
  const [orderLoading, setOrderLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchMenu();
  }, []);

  useEffect(() => {
    localStorage.setItem('foodnest_cart', JSON.stringify(cart));
  }, [cart]);

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

  const addToCart = (item) => {
    if (item.is_available === false) return;
    setCart(prev => ({
      ...prev,
      [item.id]: {
        ...item,
        quantity: (prev[item.id]?.quantity || 0) + 1
      }
    }));
  };

  const removeFromCart = (itemId) => {
    setCart(prev => {
      const updated = { ...prev };
      if (updated[itemId]?.quantity > 1) {
        updated[itemId] = { ...updated[itemId], quantity: updated[itemId].quantity - 1 };
      } else {
        delete updated[itemId];
      }
      return updated;
    });
  };

  const getCartCount = () => Object.values(cart).reduce((sum, item) => sum + item.quantity, 0);

  const getCartTotal = () => Object.values(cart).reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleProceedToPayment = () => {
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
    const items = Object.values(cart).map(item => ({
      menuItem: item.id,
      quantity: item.quantity
    }));

    if (items.length === 0) return;

    setOrderLoading(true);
    try {
      await axios.post('/orders', { items, payment_method: paymentMethod });
      setCart({});
      setShowCart(false);
      setCartStep('cart');
      setMessage({ type: 'success', text: 'Order placed successfully! 🎉' });
      setTimeout(() => setMessage({ type: '', text: '' }), 4000);
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to place order' });
    } finally {
      setOrderLoading(false);
    }
  };

  if (loading) {
    return <LoadingState />;
  }

  // Filter items by Search text and Veg Only preference
  const filteredMenuItems = menuItems.filter(item => {
    const matchesVeg = !vegOnly || item.is_veg !== false;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q ||
      item.item_name.toLowerCase().includes(q) ||
      (item.category || '').toLowerCase().includes(q);
    return matchesVeg && matchesSearch;
  });

  const categories = Object.entries(
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

  const allCategories = Array.from(new Set(menuItems.map(item => item.category || 'General'))).sort((a, b) => {
    const isStarterA = a.toLowerCase().includes('starter') || a.toLowerCase().includes('starer');
    const isStarterB = b.toLowerCase().includes('starter') || b.toLowerCase().includes('starer');
    if (isStarterA && !isStarterB) return -1;
    if (!isStarterA && isStarterB) return 1;
    return a.localeCompare(b);
  });

  const categoryNames = ['All', ...allCategories];
  const displayedCategories = selectedCategory === 'All'
    ? categories
    : categories.filter(([cat]) => cat === selectedCategory);

  return (
    <div>
      <PageHeader title="Menu" subtitle="Browse items and add to your cart" />

      <AlertBanner type={message.type} show={!!message.text}>
        {message.type === 'success' ? <CheckCircle size={16} style={{ marginRight: '0.5rem', display: 'inline' }} /> : <AlertCircle size={16} style={{ marginRight: '0.5rem', display: 'inline' }} />}
        {message.text}
      </AlertBanner>

      {menuItems.length === 0 ? (
        <EmptyState icon={Package} title="No items available" description="Check back later for new menu items." />
      ) : (
        <>
          {/* Search bar & Veg Only Quick Filter */}
          <div className="menu-toolbar">
            <div className="menu-search-wrap">
              <Search size={16} className="search-bar-icon" />
              <input
                type="text"
                className="menu-search-input"
                placeholder="Search menu (e.g. Biryani, Paneer, Starters...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                id="menu-search-input"
              />
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
              whileTap={{ scale: 0.95 }}
              id="veg-only-toggle"
            >
              <span className="veg-indicator veg" style={{ width: 10, height: 10 }} />
              <span>Veg Only</span>
            </MotionButton>
          </div>

          {/* Side-by-side Category Buttons Navigation */}
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
                  whileTap={{ scale: 0.95 }}
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

                <motion.div
                  className="menu-grid"
                  variants={staggerContainer}
                  initial="initial"
                  animate="animate"
                >
                  {items.map((item, index) => {
                    const isOutOfStock = !item.is_available;
                    return (
                      <motion.div
                        key={item.id}
                        className={`menu-card ${isOutOfStock ? 'out-of-stock' : ''}`}
                        variants={fadeUp}
                        transition={{ delay: index * 0.04 }}
                        whileHover={isOutOfStock ? {} : { y: -4, transition: { duration: 0.2 } }}
                      >
                        <div className="menu-card-img-wrap">
                          <div className="menu-card-img-badge">
                            <span
                              className={`veg-indicator ${item.is_veg !== false ? 'veg' : 'non-veg'}`}
                              title={item.is_veg !== false ? 'Veg' : 'Non-Veg'}
                            />
                            <span>{item.is_veg !== false ? 'Veg' : 'Non-Veg'}</span>
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
                              onError={(e) => {
                                e.target.style.display = 'none';
                                if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
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
                            <UtensilsCrossed size={36} />
                          </div>
                        </div>

                        <div className="menu-card-body">
                          <div className="menu-card-header">
                            <div className="menu-card-top-row">
                              <div
                                className="menu-item-name"
                                style={isOutOfStock ? { color: 'var(--text-muted)' } : {}}
                                title={item.item_name}
                              >
                                {item.item_name}
                              </div>
                              <div
                                className="menu-item-price"
                                style={isOutOfStock ? { opacity: 0.5, color: 'var(--text-muted)' } : {}}
                              >
                                ₹{item.price}
                              </div>
                            </div>
                            <div>
                              <span className="menu-item-category-tag">
                                {item.category || 'General'}
                              </span>
                            </div>
                          </div>

                          <div className="menu-card-actions">
                            {isOutOfStock ? (
                              <button className="btn-out-of-stock" disabled>
                                Out of Stock
                              </button>
                            ) : cart[item.id] ? (
                              <div className="quantity-control">
                                <MotionButton
                                  className="quantity-btn"
                                  onClick={() => removeFromCart(item.id)}
                                  id={`decrease-${item.id}`}
                                  aria-label={`Remove one ${item.item_name}`}
                                >
                                  <Minus size={16} />
                                </MotionButton>
                                <span className="quantity-value">{cart[item.id].quantity}</span>
                                <MotionButton
                                  className="quantity-btn"
                                  onClick={() => addToCart(item)}
                                  id={`increase-${item.id}`}
                                  aria-label={`Add one more ${item.item_name}`}
                                >
                                  <Plus size={16} />
                                </MotionButton>
                              </div>
                            ) : (
                              <MotionButton
                                className="btn btn-primary"
                                onClick={() => addToCart(item)}
                                id={`add-${item.id}`}
                              >
                                <Plus size={16} /> Add to Cart
                              </MotionButton>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </motion.div>
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
                <MotionButton className="btn btn-secondary" onClick={() => setCart({})} id="clear-cart">
                  Clear Cart
                </MotionButton>
                <MotionButton className="btn btn-primary" onClick={handleProceedToPayment} id="proceed-to-payment">
                  Place Order
                </MotionButton>
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
              <MotionButton className="btn btn-primary" onClick={placeOrder} disabled={orderLoading} id="confirm-order">
                {orderLoading ? <div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> : 'Confirm Order'}
              </MotionButton>
            </div>
          </>
        )}
      </AnimatedModal>
    </div>
  );
};

export default MenuPage;
