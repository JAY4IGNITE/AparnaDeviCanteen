import { useState, useEffect } from 'react';
import axios from 'axios';
import { ShoppingCart, Plus, Minus, X, CheckCircle, AlertCircle, Package } from 'lucide-react';

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
      setMenuItems(res.data.data);
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to load menu' });
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (item) => {
    setCart(prev => ({
      ...prev,
      [item._id]: {
        ...item,
        quantity: (prev[item._id]?.quantity || 0) + 1
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
      menuItem: item._id,
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
    return <div className="loading-spinner"><div className="spinner"></div></div>;
  }

  return (
    <div>
      <div className="page-header">
        <h1>Menu</h1>
        <p>Browse items and add to your cart</p>
      </div>

      {message.text && (
        <div className={`alert alert-${message.type}`}>
          {message.type === 'success' ? <CheckCircle size={16} style={{ marginRight: '0.5rem', display: 'inline' }} /> : <AlertCircle size={16} style={{ marginRight: '0.5rem', display: 'inline' }} />}
          {message.text}
        </div>
      )}

      {menuItems.length === 0 ? (
        <div className="empty-state">
          <Package size={64} />
          <h3>No items available</h3>
          <p>Check back later for new menu items.</p>
        </div>
      ) : (
        <div className="menu-grid">
          {menuItems.map(item => (
            <div className="menu-card" key={item._id}>
              <div className="menu-card-header">
                <div>
                  <div className="menu-item-name">{item.itemName}</div>
                  <div className="menu-item-category">{item.category || 'General'}</div>
                </div>
                <div className="menu-item-price">₹{item.price}</div>
              </div>

              <div className="menu-card-actions">
                {cart[item._id] ? (
                  <div className="quantity-control">
                    <button className="quantity-btn" onClick={() => removeFromCart(item._id)} id={`decrease-${item._id}`}>
                      <Minus size={16} />
                    </button>
                    <span className="quantity-value">{cart[item._id].quantity}</span>
                    <button className="quantity-btn" onClick={() => addToCart(item)} id={`increase-${item._id}`}>
                      <Plus size={16} />
                    </button>
                  </div>
                ) : (
                  <button className="btn btn-primary btn-sm" onClick={() => addToCart(item)} id={`add-${item._id}`}>
                    <Plus size={16} /> Add
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Floating Cart Button */}
      {getCartCount() > 0 && (
        <div className="cart-float">
          <button className="cart-btn" onClick={() => setShowCart(true)} id="open-cart">
            <ShoppingCart size={22} />
            View Cart
            <span className="cart-badge">{getCartCount()}</span>
          </button>
        </div>
      )}

      {/* Cart Modal */}
      {showCart && (
        <div className="modal-overlay" onClick={() => setShowCart(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Your Cart</h3>
              <button className="btn btn-ghost" onClick={() => setShowCart(false)} id="close-cart">
                <X size={22} />
              </button>
            </div>

            <div className="modal-body">
              {Object.values(cart).length === 0 ? (
                <div className="empty-state">
                  <ShoppingCart size={48} />
                  <p>Your cart is empty</p>
                </div>
              ) : (
                <>
                  {Object.values(cart).map(item => (
                    <div className="cart-item" key={item._id}>
                      <div className="cart-item-info">
                        <h4>{item.itemName}</h4>
                        <p>₹{item.price} × {item.quantity}</p>
                      </div>
                      <div className="quantity-control">
                        <button className="quantity-btn" onClick={() => removeFromCart(item._id)}>
                          <Minus size={14} />
                        </button>
                        <span className="quantity-value">{item.quantity}</span>
                        <button className="quantity-btn" onClick={() => addToCart(item)}>
                          <Plus size={14} />
                        </button>
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
                <button className="btn btn-secondary" onClick={() => setCart({})} id="clear-cart">
                  Clear Cart
                </button>
                <button className="btn btn-primary" onClick={placeOrder} disabled={orderLoading} id="place-order">
                  {orderLoading ? <div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }}></div> : 'Place Order'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuPage;
