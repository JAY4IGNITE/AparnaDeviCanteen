import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { UtensilsCrossed, ShoppingBag, Megaphone } from 'lucide-react';
import InteractiveCard from '../../components/ui/InteractiveCard';
import { useMotionSafe } from '../../lib/motion';

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [announcementCount, setAnnouncementCount] = useState(0);
  const [loadingAnnouncements, setLoadingAnnouncements] = useState(true);
  const { transition } = useMotionSafe();

  useEffect(() => {
    fetchAnnouncementCount();
  }, []);

  const fetchAnnouncementCount = async () => {
    try {
      setLoadingAnnouncements(true);
      const res = await axios.get('/announcements');
      if (res.data.success) {
        setAnnouncementCount(res.data.count || 0);
      }
    } catch (err) {
      console.error('Failed to fetch announcements for home page:', err);
    } finally {
      setLoadingAnnouncements(false);
    }
  };

  const cards = [
    {
      icon: UtensilsCrossed,
      title: 'Browse Menu',
      description: 'Explore our delicious offerings',
      color: 'orange',
      path: '/customer/menu',
    },
    {
      icon: ShoppingBag,
      title: 'My Orders',
      description: 'Track your order history',
      color: 'blue',
      path: '/customer/orders',
    },
    {
      icon: Megaphone,
      title: 'Announcements',
      description: loadingAnnouncements
        ? 'Checking updates...'
        : announcementCount > 0
          ? `${announcementCount} active ${announcementCount === 1 ? 'announcement' : 'announcements'}`
          : 'No new announcements',
      color: 'green',
      path: '/customer/announcements',
      badge: announcementCount > 0 ? announcementCount : null,
      highlight: announcementCount > 0,
    },
  ];

  return (
    <div>
      <motion.div
        className="welcome-section"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={transition}
      >
        <h1 className="welcome-title">
          Welcome, <span>{user?.name || 'Guest'}!</span>
        </h1>
        <p className="welcome-subtitle">
          What would you like to eat today? Browse our menu and place your order.
        </p>
      </motion.div>

      <div className="bento-grid">
        {cards.map((card, index) => (
          <InteractiveCard
            key={card.path}
            index={index}
            className="bento-card"
            onClick={() => navigate(card.path)}
          >
            {card.badge && <span className="bento-badge">{card.badge}</span>}
            <div className={`stat-icon ${card.color} bento-card-icon`}>
              <card.icon size={28} />
            </div>
            <h3>{card.title}</h3>
            <p style={card.highlight ? { color: 'var(--success)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.35rem' } : undefined}>
              {card.highlight && <span className="pulse-dot" />}
              {card.description}
            </p>
          </InteractiveCard>
        ))}
      </div>
    </div>
  );
};

export default Home;
