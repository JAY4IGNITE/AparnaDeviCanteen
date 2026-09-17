import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RotateCcw, Plus, Check, UtensilsCrossed, ChevronRight } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import MotionButton from '../ui/MotionButton';
import SpotlightCard from '../ui/SpotlightCard';
import CountUp from '../ui/CountUp';

const OrderAgain = ({ orders = [], allMenuItems = [], loading = false }) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [addedIds, setAddedIds] = useState({});

  // Extract unique recently ordered dishes from completed or existing orders
  const recentItems = useMemo(() => {
    if (!orders || orders.length === 0) return [];

    const itemMap = new Map();
    const menuMap = new Map((allMenuItems || []).map((m) => [m.id, m]));
    const menuByName = new Map((allMenuItems || []).map((m) => [m.item_name.toLowerCase().trim(), m]));

    for (const order of orders) {
      if (order.status === 'Cancelled') continue;
      for (const item of order.order_items || []) {
        const menuItem = (item.menu_item_id && menuMap.get(item.menu_item_id)) ||
          menuByName.get((item.item_name || '').toLowerCase().trim());

        const dishId = menuItem?.id || item.menu_item_id || item.item_name;
        if (!itemMap.has(dishId)) {
          itemMap.set(dishId, {
            id: menuItem?.id || item.menu_item_id,
            item_name: menuItem?.item_name || item.item_name,
            price: menuItem?.price || item.price,
            image_url: menuItem?.image_url || null,
            category: menuItem?.category || 'Special',
            is_available: menuItem?.is_available !== false,
            is_veg: menuItem?.is_veg,
          });
        }
      }
    }

    return Array.from(itemMap.values()).slice(0, 4);
  }, [orders, allMenuItems]);

  const handleAddAgain = (item) => {
    if (!item.is_available) return;
    const added = addToCart(item);
    if (added !== false) {
      setAddedIds((prev) => ({ ...prev, [item.id || item.item_name]: true }));
      setTimeout(() => {
        setAddedIds((prev) => ({ ...prev, [item.id || item.item_name]: false }));
      }, 1200);
    }
  };

  if (loading) {
    return null;
  }

  // If no past orders
  if (recentItems.length === 0) {
    return (
      <section className="dashboard-section order-again-section" aria-label="Previous dishes">
        <div className="section-header-row">
          <div>
            <h3 className="section-title">Order Again</h3>
            <p className="section-subtitle">Quickly reorder your canteen favorites</p>
          </div>
        </div>
        <div className="order-again-empty-box">
          <p className="order-again-empty-text">You haven't ordered yet. Place your first order to see your favorites here!</p>
          <MotionButton
            type="button"
            className="order-again-browse-btn"
            onClick={() => navigate('/customer/menu')}
            whileTap={{ scale: 0.95 }}
          >
            <span>Explore Menu</span>
            <ChevronRight size={15} />
          </MotionButton>
        </div>
      </section>
    );
  }

  return (
    <section className="dashboard-section order-again-section" aria-label="Order again previous favorites">
      <div className="section-header-row">
        <div className="section-title-wrap">
          <div className="section-icon-pill">
            <RotateCcw size={18} />
          </div>
          <div>
            <h3 className="section-title">Order Again</h3>
            <p className="section-subtitle">Your recently ordered canteen favorites</p>
          </div>
        </div>

        <MotionButton
          type="button"
          className="section-link-btn"
          onClick={() => navigate('/customer/orders')}
          aria-label="View order history"
          dockMagnification={1.08}
        >
          <span>Order History</span>
          <ChevronRight size={16} />
        </MotionButton>
      </div>

      <div className="order-again-grid" role="list">
        {recentItems.map((item) => {
          const key = item.id || item.item_name;
          const isAdded = !!addedIds[key];

          return (
            <SpotlightCard
              key={key}
              className="order-again-card"
              spotlightColor="rgba(249, 115, 22, 0.16)"
              spotlightSize={240}
              role="listitem"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', width: '100%' }}>
                <div className="order-again-img-wrap">
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.item_name}
                      className="order-again-img"
                      loading="lazy"
                      decoding="async"
                      width="54"
                      height="54"
                      style={{ opacity: 0, transition: 'opacity 0.3s ease-in-out' }}
                      onLoad={(e) => {
                        e.currentTarget.style.opacity = '1';
                        const placeholder = e.currentTarget.closest('.order-again-img-wrap')?.querySelector('.order-again-placeholder');
                        if (placeholder) placeholder.style.display = 'none';
                      }}
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        const placeholder = e.currentTarget.closest('.order-again-img-wrap')?.querySelector('.order-again-placeholder');
                        if (placeholder) placeholder.style.display = 'flex';
                      }}
                    />
                  ) : null}

                  <div
                    className="order-again-placeholder"
                    style={{ display: 'flex' }}
                  >
                    <UtensilsCrossed size={20} />
                  </div>
                </div>

                <div className="order-again-info">
                  <span className="order-again-name" title={item.item_name}>
                    {item.item_name}
                  </span>
                  <span className="order-again-price">
                    <span>₹</span>
                    <CountUp to={item.price} duration={0.8} />
                  </span>
                </div>

                <MotionButton
                  type="button"
                  className={`order-again-add-btn ${isAdded ? 'added' : ''}`}
                  onClick={() => handleAddAgain(item)}
                  disabled={!item.is_available}
                  whileTap={{ scale: 0.92 }}
                  aria-label={`Add ${item.item_name} again`}
                  id={`order-again-btn-${(item.id || item.item_name).toString().slice(0, 8)}`}
                >
                  {isAdded ? (
                    <>
                      <Check size={14} />
                      <span>Added</span>
                    </>
                  ) : (
                    <>
                      <Plus size={14} />
                      <span>Add</span>
                    </>
                  )}
                </MotionButton>
              </div>
            </SpotlightCard>
          );
        })}
      </div>
    </section>
  );
};

export default OrderAgain;
