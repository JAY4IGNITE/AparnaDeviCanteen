import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'motion/react';
import { ChevronRight, RefreshCw, AlertCircle } from 'lucide-react';
import TrendingFoodCard from './TrendingFoodCard';
import MotionButton from '../ui/MotionButton';

const TrendingToday = () => {
  const navigate = useNavigate();
  const [trendingDishes, setTrendingDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTrending = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get('/menu/trending-today');
      if (res.data.success) {
        setTrendingDishes(res.data.data || []);
      } else {
        throw new Error(res.data.message || 'Failed to fetch trending');
      }
    } catch (err) {
      console.error('Failed to load trending dishes:', err);
      setError(err.response?.data?.message || 'Couldn\'t load today\'s trending dishes.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTrending();
  }, [fetchTrending]);

  return (
    <section className="dashboard-section trending-section" aria-label="Trending dishes today">
      <div className="section-header-row">
        <div className="section-title-wrap">
          <div>
            <h3 className="section-title">Trending Today</h3>
            <p className="section-subtitle">Most popular dishes ordered by canteen customers today</p>
          </div>
        </div>

        <MotionButton
          type="button"
          className="section-link-btn"
          onClick={() => navigate('/customer/menu')}
          aria-label="View all menu items"
          dockMagnification={1.08}
        >
          <span>View all</span>
          <ChevronRight size={16} />
        </MotionButton>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="trending-grid" aria-label="Loading trending items">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="trending-card-skeleton">
              <div className="skeleton-image" />
              <div className="skeleton-body">
                <div className="skeleton-line" style={{ width: '40%', height: 14 }} />
                <div className="skeleton-line" style={{ width: '80%', height: 20 }} />
                <div className="skeleton-footer">
                  <div className="skeleton-line" style={{ width: '30%', height: 22 }} />
                  <div className="skeleton-line" style={{ width: '35%', height: 36, borderRadius: 8 }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error Fallback */}
      {!loading && error && (
        <div className="trending-error-card">
          <AlertCircle size={24} className="trending-error-icon" />
          <div className="trending-error-text">
            <p className="trending-error-title">Couldn't load today's trending dishes.</p>
            <p className="trending-error-detail">{error}</p>
          </div>
          <MotionButton
            type="button"
            className="trending-retry-btn"
            onClick={fetchTrending}
            whileTap={{ scale: 0.95 }}
          >
            <RefreshCw size={15} />
            <span>Try Again</span>
          </MotionButton>
        </div>
      )}

      {/* Zero Orders Today Fallback */}
      {!loading && !error && trendingDishes.length === 0 && (
        <div className="trending-empty-card">
          <div className="trending-empty-content">
            <h4 className="trending-empty-title">Today's favourites are getting ready</h4>
            <p className="trending-empty-desc">
              No orders have started trending yet today. Explore our menu, be the first to order, and set today's trend!
            </p>
            <MotionButton
              type="button"
              className="trending-empty-cta"
              onClick={() => navigate('/customer/menu')}
              whileTap={{ scale: 0.96 }}
            >
              <span>Explore Menu</span>
              <ChevronRight size={16} />
            </MotionButton>
          </div>
        </div>
      )}

      {/* Dynamic Trending Dish Grid */}
      {!loading && !error && trendingDishes.length > 0 && (
        <div className="trending-grid" role="list">
          {trendingDishes.map((dish, index) => (
            <TrendingFoodCard
              key={dish.id}
              item={dish}
              isTopOne={index === 0}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default TrendingToday;
