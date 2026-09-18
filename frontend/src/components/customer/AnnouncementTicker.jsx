import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Megaphone, ChevronRight, X, Sparkles } from 'lucide-react';
import './AnnouncementTicker.css';

const AnnouncementTicker = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [dismissed, setDismissed] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const res = await axios.get('/announcements');
      if (res.data?.success && Array.isArray(res.data.data)) {
        setAnnouncements(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load announcements for ticker:', err);
    }
  };

  if (dismissed || announcements.length === 0) {
    return null;
  }

  // Render announcement list block with distinct separated pills
  const renderAnnouncementItems = () => (
    <div className="marquee-item-group">
      {announcements.map((item, index) => (
        <div key={item.id || index} className="announcement-pill-item">
          <span className="pill-notice-text">{item.message}</span>
          <Sparkles size={13} className="pill-separator-icon" />
        </div>
      ))}
    </div>
  );

  return (
    <div className="announcement-ticker-root">
      <div className="announcement-badge">
        <span className="live-dot-pulse" />
        <Megaphone size={14} className="announcement-icon" />
        <span className="badge-text">LIVE ALERTS</span>
      </div>

      <div 
        className="announcement-marquee-container"
        onClick={() => navigate('/customer/announcements')}
        title="Click to view full notices and announcements"
      >
        <div className="announcement-marquee-track">
          {renderAnnouncementItems()}
          {renderAnnouncementItems()}
        </div>
      </div>

      <div className="announcement-actions">
        <button 
          type="button" 
          className="announcement-view-btn"
          onClick={() => navigate('/customer/announcements')}
          title="View all announcements"
        >
          <span>View All</span>
          <ChevronRight size={14} />
        </button>
        <button 
          type="button" 
          className="announcement-close-btn"
          onClick={(e) => {
            e.stopPropagation();
            setDismissed(true);
          }}
          title="Dismiss notification ticker"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
};

export default AnnouncementTicker;
