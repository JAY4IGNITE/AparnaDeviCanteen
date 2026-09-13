import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingCart } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import MotionButton from '../ui/MotionButton';
import BlurText from '../ui/BlurText';

const DashboardHeader = () => {
  const { user } = useAuth();
  const { getCartCount } = useCart();
  const navigate = useNavigate();

  const cartCount = getCartCount();

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Good morning';
    if (hour >= 12 && hour < 17) return 'Good afternoon';
    return 'Good evening';
  }, []);

  const displayName = useMemo(() => {
    if (!user?.name) return '';
    return user.name.trim().split(' ')[0];
  }, [user]);

  const greetingFull = `${greeting}${displayName ? `, ${displayName}` : ''}`;

  return (
    <header className="customer-header" aria-label="Dashboard greeting and quick actions">
      <div className="header-greeting-block">
        <h1 className="header-greeting-title" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
          <BlurText text={greetingFull} delay={45} animateBy="words" />
        </h1>
        <p className="header-greeting-subtitle">What are you craving today?</p>
      </div>

      <div className="header-actions-group">
        {/* Sleek, Smooth Cart Shortcut - Static position with tactile click response */}
        <MotionButton
          type="button"
          className={`header-cart-btn ${cartCount > 0 ? 'has-items' : ''}`}
          onClick={() => navigate('/customer/menu?cart=open')}
          aria-label={cartCount > 0 ? `Cart with ${cartCount} items` : 'Shopping cart is empty'}
          title="View Cart"
          dockEffect={false}
          whileTap={{ scale: 0.96 }}
          id="header-cart-btn"
        >
          <span className="header-cart-icon-wrap">
            <ShoppingCart size={19} />
          </span>
          <span className="header-cart-text">Cart</span>
          <AnimatePresence mode="popLayout">
            {cartCount > 0 && (
              <motion.span
                key={cartCount}
                className="header-cart-count"
                id="header-cart-counter"
                initial={{ scale: 0.4, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.4, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 22 }}
              >
                {cartCount}
              </motion.span>
            )}
          </AnimatePresence>
        </MotionButton>
      </div>
    </header>
  );
};

export default DashboardHeader;
