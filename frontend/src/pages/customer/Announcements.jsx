import { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, Clock, Bell } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import LoadingState from '../../components/ui/LoadingState';
import EmptyState from '../../components/ui/EmptyState';
import AlertBanner from '../../components/ui/AlertBanner';
import './Announcements.css';

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
    <div className="announcements-page">
      <PageHeader
        title="Offers & Updates"
        subtitle="Stay updated with the latest happenings, daily specials, and offers at AparnaDevi Canteen"
      />

      {error && <AlertBanner type="error" message={error} onClose={() => setError(null)} />}

      {loading ? (
        <LoadingState />
      ) : announcements.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="All caught up!"
          description="There are no active announcements or offers right now. Check back later!"
        />
      ) : (
        <div className="announcements-list">
          {announcements.map((ann, index) => (
            <div
              key={ann.id}
              className="announcement-card"
              style={{ animationDelay: `${index * 0.08}s` }}
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
                      day: 'numeric',
                    })}
                  </span>
                  <span className="meta-item time-pill">
                    <Clock size={14} />
                    {new Date(ann.created_at).toLocaleTimeString(undefined, {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomerAnnouncements;
