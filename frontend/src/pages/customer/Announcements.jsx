import { useState, useEffect } from 'react';
import axios from 'axios';
import { Megaphone, AlertCircle, Sparkles } from 'lucide-react';
import './Announcements.css'; // We'll create this or use index.css

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
      {/* Animated Background Elements */}
      <div className="blob blob-1"></div>
      <div className="blob blob-2"></div>
      <div className="blob blob-3"></div>
      
      <div className="announcements-content">
        <header className="announcements-header">
          <div className="header-icon-wrapper">
            <Megaphone size={32} className="pulse-icon" />
          </div>
          <h1 className="announcements-title">
            Latest Updates <Sparkles size={24} className="sparkle-icon" />
          </h1>
          <p className="announcements-subtitle">What's new at AparnaCanteen</p>
        </header>

        {loading ? (
          <div className="announcements-loading">
            <div className="spinner"></div>
            <p>Loading announcements...</p>
          </div>
        ) : error ? (
          <div className="announcements-error">
            <AlertCircle size={48} />
            <p>{error}</p>
          </div>
        ) : announcements.length === 0 ? (
          <div className="announcements-empty">
            <div className="empty-icon-wrapper">
              <Megaphone size={48} />
            </div>
            <h2>You're all caught up!</h2>
            <p>No new announcements at the moment.</p>
          </div>
        ) : (
          <div className="announcements-list">
            {announcements.map((ann, index) => (
              <div 
                key={ann.id} 
                className="announcement-card" 
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                <div className="card-indicator"></div>
                <div className="card-body">
                  <p className="card-message">{ann.message}</p>
                  <span className="card-date">
                    {new Date(ann.created_at).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>
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
