import { useAuth } from '../../context/AuthContext';
import { UtensilsCrossed, ShoppingBag, Star } from 'lucide-react';

const Home = () => {
  const { user } = useAuth();

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
        <div className="card" style={{ textAlign: 'center', cursor: 'pointer' }} onClick={() => window.location.href = '/customer/menu'}>
          <div className="stat-icon orange" style={{ margin: '0 auto 1rem', width: '56px', height: '56px' }}>
            <UtensilsCrossed size={28} />
          </div>
          <h3 style={{ marginBottom: '0.35rem' }}>Browse Menu</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Explore our delicious offerings
          </p>
        </div>

        <div className="card" style={{ textAlign: 'center', cursor: 'pointer' }} onClick={() => window.location.href = '/customer/orders'}>
          <div className="stat-icon blue" style={{ margin: '0 auto 1rem', width: '56px', height: '56px' }}>
            <ShoppingBag size={28} />
          </div>
          <h3 style={{ marginBottom: '0.35rem' }}>My Orders</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Track your order history
          </p>
        </div>

        <div className="card" style={{ textAlign: 'center' }}>
          <div className="stat-icon green" style={{ margin: '0 auto 1rem', width: '56px', height: '56px' }}>
            <Star size={28} />
          </div>
          <h3 style={{ marginBottom: '0.35rem' }}>Announcements</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            No new announcements
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;
