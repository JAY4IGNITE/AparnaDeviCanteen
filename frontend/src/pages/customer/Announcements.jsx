import { useState, useEffect } from 'react';
import axios from 'axios';
import { Megaphone, AlertCircle, Sparkles, Calendar, Clock } from 'lucide-react';
import './Announcements.css';

// Generate static configuration for bubbles once to prevent re-renders from resetting animations
const BUBBLES = Array.from({ length: 15 }, (_, i) => {
  const size = Math.floor(Math.random() * 80) + 45; // size between 45px and 125px
  const left = `${Math.floor(Math.random() * 90) + 5}%`; // horizontal position
  const delay = `${(Math.random() * 8).toFixed(1)}s`; // animation delay
  const duration = `${(Math.floor(Math.random() * 12) + 16)}s`; // duration between 16s and 28s
  const opacity = (Math.random() * 0.12 + 0.06).toFixed(2); // opacity range
  
  // Vibrant warm accents matching the canteen theme (oranges, ambers, warm yellow)
  const colors = [
    'rgba(249, 115, 22, 0.2)',  // primary orange
    'rgba(234, 88, 12, 0.15)', // dark orange
    'rgba(245, 158, 11, 0.15)', // amber
    'rgba(251, 191, 36, 0.1)'   // yellow
  ];
  const color = colors[i % colors.length];
  const blur = i % 3 === 0 ? '2px' : i % 3 === 1 ? '1px' : '0px';

  return { id: i, size, left, delay, duration, opacity, color, blur };
});

const CustomerAnnouncements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get('/announcements');
      if (res.data.success) {
        setAnnouncements(res.data.data);
      } else {
        setError(res.data.message);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch announcements');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="announcements-container">
      {/* Dynamic Animated Bubble Particles */}
      <div className="bubbles-container">
        {BUBBLES.map((bubble) => (
          <div
            key={bubble.id}
            className="bubble"
            style={{
              '--bubble-size': `${bubble.size}px`,
              '--bubble-left': bubble.left,
              '--bubble-delay': bubble.delay,
              '--bubble-duration': bubble.duration,
              '--bubble-opacity': bubble.opacity,
              '--bubble-glow': bubble.color,
              '--bubble-blur': bubble.blur,
            }}
          />
        ))}
      </div>
      
      <div className="announcements-content">
        <header className="announcements-header">
          <div className="header-icon-wrapper">
            <Megaphone size={32} className="pulse-icon" />
          </div>
          <h1 className="announcements-title">
            Latest Updates <Sparkles size={24} className="sparkle-icon" />
          </h1>
          <p className="announcements-subtitle">Stay updated with the latest happenings at AparnaCanteen</p>
        </header>

        {loading ? (
          <div className="announcements-loading">
            <div className="spinner"></div>
            <p>Fetching latest announcements...</p>
          </div>
        ) : error ? (
          <div className="announcements-error">
            <AlertCircle size={48} className="error-icon" />
            <p>{error}</p>
          </div>
        ) : announcements.length === 0 ? (
          <div className="announcements-empty">
            <div className="empty-icon-wrapper">
              <Megaphone size={48} />
            </div>
            <h2>All caught up!</h2>
            <p>There are no active announcements right now. Check back later!</p>
          </div>
        ) : (
          <div className="announcements-list">
            {announcements.map((ann, index) => (
              <div 
                key={ann.id} 
                className="announcement-card" 
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="card-indicator"></div>
                <div className="card-body">
                  <p className="card-message">{ann.message}</p>
                  <div className="card-meta">
                    <span className="meta-item date-pill">
                      <Calendar size={14} />
                      {new Date(ann.created_at).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                    <span className="meta-item time-pill">
                      <Clock size={14} />
                      {new Date(ann.created_at).toLocaleTimeString(undefined, {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerAnnouncements;
