import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Minus, Check, Flame, UtensilsCrossed } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import MotionButton from '../ui/MotionButton';
import SpotlightCard from '../ui/SpotlightCard';

const TrendingFoodCard = ({ item, isTopOne = false }) => {
  const { cart, addToCart, removeFromCart } = useCart();
  const [justAdded, setJustAdded] = useState(false);

  const cartItem = cart[item.id];
  const quantity = cartItem?.quantity || 0;
  const isOutOfStock = !item.is_available;

  const handleAdd = () => {
    if (isOutOfStock) return;
    const added = addToCart(item);
    if (added !== false) {
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 1200);
    }
  };

  return (
    <div className="trending-card-tilt-wrap">
      <SpotlightCard
        className={`trending-card ${isTopOne ? 'top-ranked' : ''} ${isOutOfStock ? 'is-disabled' : ''}`}
        spotlightColor={isTopOne ? 'rgba(249, 115, 22, 0.28)' : 'rgba(249, 115, 22, 0.16)'}
        spotlightSize={320}
        id={`trending-dish-${item.id}`}
      >
        {/* Visual Rank / Trending Badge with ShinyText */}
        <div className="trending-badge-bar">
          <span className={`trending-rank-pill ${isTopOne ? 'pill-rank-1' : ''}`}>
            <Flame size={14} className="trending-flame-icon" />
            <span>{isTopOne ? '#1 Trending Today' : 'Trending Today'}</span>
          </span>

          {/* Portion Count Metric */}
          {item.orders_today > 0 && (
            <span className="trending-count-tag" title="Total portions ordered today">
              <strong>{item.orders_today}</strong> ordered today
            </span>
          )}
        </div>

        {/* Food Image Container */}
        <div className="trending-card-img-wrap">
          {item.image_url ? (
            <img
              src={item.image_url}
              alt={item.item_name}
              className="trending-food-image"
              loading="lazy"
              decoding="async"
              width="320"
              height="190"
              style={{ opacity: 0, transition: 'opacity 0.3s ease-in-out' }}
              onLoad={(e) => {
                e.currentTarget.style.opacity = '1';
                const placeholder = e.currentTarget.closest('.trending-card-img-wrap')?.querySelector('.trending-card-img-placeholder');
                if (placeholder) placeholder.style.display = 'none';
              }}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                const placeholder = e.currentTarget.closest('.trending-card-img-wrap')?.querySelector('.trending-card-img-placeholder');
                if (placeholder) placeholder.style.display = 'flex';
              }}
            />
          ) : null}

          <div
            className="trending-card-img-placeholder"
            style={{ display: 'flex' }}
          >
            <UtensilsCrossed size={36} className="trending-card-placeholder-icon" />
          </div>


        </div>

        {/* Dish Info & Ordering */}
        <div className="trending-card-body">
          <div className="trending-card-info">
            <h4 className="trending-food-title" title={item.item_name}>
              {item.item_name}
            </h4>
            {item.description && (
              <p className="trending-food-desc" title={item.description}>
                {item.description}
              </p>
            )}
          </div>

          <div className="trending-card-footer">
            <div className="trending-price-tag">
              <span className="trending-rupee">₹</span>
              <span className="trending-amount">{item.price}</span>
            </div>

            {/* Add / Quantity Controls - Static position responding only while clicking */}
            {isOutOfStock ? (
              <button className="trending-add-btn disabled" disabled>
                Unavailable
              </button>
            ) : quantity > 0 ? (
              <div className="trending-qty-controls">
                <MotionButton
                  type="button"
                  className="trending-qty-btn"
                  onClick={() => removeFromCart(item.id)}
                  aria-label={`Remove one ${item.item_name}`}
                  whileTap={{ scale: 0.88 }}
                >
                  <Minus size={14} />
                </MotionButton>
                <motion.span
                  key={quantity}
                  className="trending-qty-number"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                >
                  {quantity}
                </motion.span>
                <MotionButton
                  type="button"
                  className="trending-qty-btn"
                  onClick={handleAdd}
                  aria-label={`Add another ${item.item_name}`}
                  whileTap={{ scale: 0.88 }}
                >
                  <Plus size={14} />
                </MotionButton>
              </div>
            ) : (
              <MotionButton
                type="button"
                className={`trending-add-btn ${justAdded ? 'added' : ''}`}
                onClick={handleAdd}
                aria-label={`Add ${item.item_name} to cart`}
                whileTap={{ scale: 0.94 }}
                id={`trending-add-${item.id}`}
              >
                <AnimatePresence mode="wait">
                  {justAdded ? (
                    <motion.span
                      key="added"
                      initial={{ scale: 0.7, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.7, opacity: 0 }}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                    >
                      <Check size={16} />
                      <span>Added</span>
                    </motion.span>
                  ) : (
                    <motion.span
                      key="add"
                      initial={{ scale: 0.7, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.7, opacity: 0 }}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                    >
                      <Plus size={16} />
                      <span>Add</span>
                    </motion.span>
                  )}
                </AnimatePresence>
              </MotionButton>
            )}
          </div>
        </div>
      </SpotlightCard>
    </div>
  );
};

export default TrendingFoodCard;
