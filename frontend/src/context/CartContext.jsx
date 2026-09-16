import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';

const CartContext = createContext(null);

const CART_STORAGE_KEY = 'foodnest_cart';

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      console.error('Error parsing cart from storage:', e);
      return {};
    }
  });

  const [isOrdersActive, setIsOrdersActive] = useState(true);
  const [isPausedModalOpen, setIsPausedModalOpen] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  const checkOrdersStatus = useCallback(async () => {
    try {
      const res = await axios.get('/menu/operating-status');
      if (res.data?.success && res.data?.data) {
        const active = Boolean(res.data.data.isOpen);
        setIsOrdersActive(active);
        setStatusMessage(res.data.data.message || '');
        return active;
      }
    } catch (err) {
      console.error('Failed to check operating status:', err);
    }
    return true;
  }, []);

  useEffect(() => {
    checkOrdersStatus();
    // Poll status periodically (every 15s) so live updates by admin reflect dynamically
    const timer = setInterval(checkOrdersStatus, 15000);
    return () => clearInterval(timer);
  }, [checkOrdersStatus]);

  // Sync to localStorage whenever cart changes
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {
      console.error('Failed to sync cart to storage:', e);
    }
  }, [cart]);

  const addToCart = useCallback((item) => {
    if (!item || item.is_available === false) return false;
    if (!isOrdersActive) {
      setIsPausedModalOpen(true);
      return false;
    }
    setCart((prev) => ({
      ...prev,
      [item.id]: {
        ...item,
        quantity: (prev[item.id]?.quantity || 0) + 1,
      },
    }));
    return true;
  }, [isOrdersActive]);

  const removeFromCart = useCallback((itemId) => {
    setCart((prev) => {
      const updated = { ...prev };
      if (updated[itemId]?.quantity > 1) {
        updated[itemId] = { ...updated[itemId], quantity: updated[itemId].quantity - 1 };
      } else {
        delete updated[itemId];
      }
      return updated;
    });
  }, []);

  const setItemQuantity = useCallback((item, quantity) => {
    if (!item) return;
    const qty = Math.max(0, parseInt(quantity, 10) || 0);
    setCart((prev) => {
      const updated = { ...prev };
      if (qty <= 0) {
        delete updated[item.id];
      } else {
        updated[item.id] = {
          ...item,
          quantity: qty,
        };
      }
      return updated;
    });
  }, []);

  const clearCart = useCallback(() => {
    setCart({});
  }, []);

  const cartCount = useMemo(() => {
    return Object.values(cart).reduce((sum, item) => sum + (item.quantity || 0), 0);
  }, [cart]);

  const cartTotal = useMemo(() => {
    return Object.values(cart).reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 0)), 0);
  }, [cart]);

  const getCartCount = useCallback(() => cartCount, [cartCount]);
  const getCartTotal = useCallback(() => cartTotal, [cartTotal]);

  const value = useMemo(() => ({
    cart,
    setCart,
    addToCart,
    removeFromCart,
    setItemQuantity,
    clearCart,
    getCartCount,
    getCartTotal,
    cartCount,
    cartTotal,
    isOrdersActive,
    setIsOrdersActive,
    isPausedModalOpen,
    setIsPausedModalOpen,
    statusMessage,
    checkOrdersStatus,
  }), [
    cart,
    addToCart,
    removeFromCart,
    setItemQuantity,
    clearCart,
    getCartCount,
    getCartTotal,
    cartCount,
    cartTotal,
    isOrdersActive,
    isPausedModalOpen,
    statusMessage,
    checkOrdersStatus,
  ]);

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export default CartContext;
