import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { UtensilsCrossed, ShoppingBag, Megaphone } from 'lucide-react';

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [announcementCount, setAnnouncementCount] = useState(0);
  const [loadingAnnouncements, setLoadingAnnouncements] = useState(true);

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

  return (
    <div>
      <div className="welcome-section">
        <h1 className="welcome-title">
          Welcome, <span>{user?.name || 'Guest'}!</span>
        </h1>
        <p className="welcome-subtitle">
          What would you like to eat today? Browse our menu and place your order.
        </p>
      </div>

      <div className="stats-grid" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div className="card" style={{ textAlign: 'center', cursor: 'pointer' }} onClick={() => navigate('/customer/menu')}>
          <div className="stat-icon orange" style={{ margin: '0 auto 1rem', width: '56px', height: '56px' }}>
            <UtensilsCrossed size={28} />
          </div>
          <h3 style={{ marginBottom: '0.35rem' }}>Browse Menu</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Explore our delicious offerings
          </p>
        </div>

        <div className="card" style={{ textAlign: 'center', cursor: 'pointer' }} onClick={() => navigate('/customer/orders')}>
          <div className="stat-icon blue" style={{ margin: '0 auto 1rem', width: '56px', height: '56px' }}>
            <ShoppingBag size={28} />
          </div>
          <h3 style={{ marginBottom: '0.35rem' }}>My Orders</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Track your order history
          </p>
        </div>

        <div className="card" style={{ textAlign: 'center', cursor: 'pointer', position: 'relative' }} onClick={() => navigate('/customer/announcements')}>
          <div className="stat-icon green" style={{ margin: '0 auto 1rem', width: '56px', height: '56px' }}>
            <Megaphone size={28} />
          </div>
          <h3 style={{ marginBottom: '0.35rem' }}>Announcements</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            {loadingAnnouncements ? (
              'Checking updates...'
            ) : announcementCount > 0 ? (
              <span style={{ color: '#2e7d32', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                <span className="pulse-dot" style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#2e7d32', display: 'inline-block' }}></span>
                {announcementCount} active {announcementCount === 1 ? 'announcement' : 'announcements'}
              </span>
            ) : (
              'No new announcements'
            )}
          </p>
          {announcementCount > 0 && (
            <span style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              backgroundColor: 'var(--danger)',
              color: 'white',
              fontSize: '0.75rem',
              fontWeight: 'bold',
              borderRadius: '50%',
              width: '20px',
              height: '20px',
              display: 'flex',
              alignItems: 'center',
              justify-content: 'center',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }}>
              {announcementCount}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
