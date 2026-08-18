import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'motion/react';
import { ShoppingCart, Plus, Minus, X, CheckCircle, AlertCircle, Package } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import AnimatedModal from '../../components/ui/AnimatedModal';
import AlertBanner from '../../components/ui/AlertBanner';
import EmptyState from '../../components/ui/EmptyState';
import LoadingState from '../../components/ui/LoadingState';
import MotionButton from '../../components/ui/MotionButton';
import { staggerContainer, fadeUp } from '../../lib/motion';

const MenuPage = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [cart, setCart] = useState({});
  const [showCart, setShowCart] = useState(false);
  const [loading, setLoading] = useState(true);
  const [orderLoading, setOrderLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchMenu();
  }, []);

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

  const placeOrder = async () => {
    const items = Object.values(cart).map(item => ({
      menuItem: item.id,
      quantity: item.quantity
    }));

    if (items.length === 0) return;

    setOrderLoading(true);
    try {
      await axios.post('/orders', { items });
      setCart({});
      setShowCart(false);
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

  const categories = Object.entries(
    menuItems.reduce((acc, item) => {
      const cat = item.category || 'General';
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(item);
      return acc;
    }, {})
  );

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
        <div className="menu-categories">
          {categories.map(([category, items]) => (
            <div key={category} className="menu-category-section">
              <h2 className="category-title">{category}</h2>
              <motion.div
                className="menu-grid"
                variants={staggerContainer}
                initial="initial"
                animate="animate"
              >
                {items.map((item, index) => (
                  <motion.div
                    key={item.id}
                    className="menu-card"
                    variants={fadeUp}
                    transition={{ delay: index * 0.04 }}
                    whileHover={{ y: -3, transition: { duration: 0.2 } }}
                  >
                    <div className="menu-card-header">
                      <div>
                        <div className="menu-item-name" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span
                            className={`veg-indicator ${item.is_veg !== false ? 'veg' : 'non-veg'}`}
                            title={item.is_veg !== false ? 'Veg' : 'Non-Veg'}
                          />
                          {item.item_name}
                        </div>
                        <div className="menu-item-category">{item.category || 'General'}</div>
                      </div>
                      <div className="menu-item-price">₹{item.price}</div>
                    </div>

                    <div className="menu-card-actions">
                      {cart[item.id] ? (
                        <div className="quantity-control">
                          <MotionButton className="quantity-btn" onClick={() => removeFromCart(item.id)} id={`decrease-${item.id}`}>
                            <Minus size={16} />
                          </MotionButton>
                          <span className="quantity-value">{cart[item.id].quantity}</span>
                          <MotionButton className="quantity-btn" onClick={() => addToCart(item)} id={`increase-${item.id}`}>
                            <Plus size={16} />
                          </MotionButton>
                        </div>
                      ) : (
                        <MotionButton className="btn btn-primary btn-sm" onClick={() => addToCart(item)} id={`add-${item.id}`}>
                          <Plus size={16} /> Add
                        </MotionButton>
                      )}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          ))}
        </div>
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

      <AnimatedModal open={showCart} onClose={() => setShowCart(false)}>
        <div className="modal-header">
          <h3>Your Cart</h3>
          <button className="btn btn-ghost" onClick={() => setShowCart(false)} id="close-cart">
            <X size={22} />
          </button>
        </div>

        <div className="modal-body">
          {Object.values(cart).length === 0 ? (
            <EmptyState icon={ShoppingCart} description="Your cart is empty" />
          ) : (
            <>
              {Object.values(cart).map(item => (
                <div className="cart-item" key={item.id}>
                  <div className="cart-item-info">
                    <h4>{item.item_name}</h4>
                    <p>₹{item.price} × {item.quantity}</p>
                  </div>
                  <div className="quantity-control">
                    <MotionButton className="quantity-btn" onClick={() => removeFromCart(item.id)}>
                      <Minus size={14} />
                    </MotionButton>
                    <span className="quantity-value">{item.quantity}</span>
                    <MotionButton className="quantity-btn" onClick={() => addToCart(item)}>
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
            <MotionButton className="btn btn-primary" onClick={placeOrder} disabled={orderLoading} id="place-order">
              {orderLoading ? <div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> : 'Place Order'}
            </MotionButton>
          </div>
        )}
      </AnimatedModal>
    </div>
  );
};

export default MenuPage;
