import { useState, useEffect } from 'react';
import axios from 'axios';
import { MessageSquare, Search, Calendar, User, Phone, MapPin } from 'lucide-react';
import { motion } from 'motion/react';
import PageHeader from '../../components/ui/PageHeader';
import EmptyState from '../../components/ui/EmptyState';
import LoadingState from '../../components/ui/LoadingState';
import { fadeUp } from '../../lib/motion';

const Feedbacks = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [blockFilter, setBlockFilter] = useState('');
  const [blocks, setBlocks] = useState([]);

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/feedback');
      if (res.data.success) {
        const data = res.data.data;
        setFeedbacks(data);
        
        // Extract unique blocks for filter dropdown
        const uniqueBlocks = Array.from(
          new Set(data.map(f => f.customer?.hostel_block).filter(Boolean))
        ).sort();
        setBlocks(uniqueBlocks);
      }
    } catch (err) {
      console.error('Failed to load feedbacks:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredFeedbacks = feedbacks.filter(item => {
    // Block filter
    if (blockFilter && item.customer?.hostel_block !== blockFilter) {
      return false;
    }

    // Search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const name = item.customer?.name?.toLowerCase() || '';
      const phone = item.customer?.phone?.toLowerCase() || '';
      const opinion = item.opinion?.toLowerCase() || '';
      const block = item.customer?.hostel_block?.toLowerCase() || '';

      return name.includes(query) || phone.includes(query) || opinion.includes(query) || block.includes(query);
    }

    return true;
  });

  if (loading) {
    return <LoadingState />;
  }

  return (
    <div>
      <PageHeader
        title="Customer Feedbacks"
        subtitle="Read opinions and reviews shared by hostel customers"
        badge={`${filteredFeedbacks.length} Received`}
      />

      {/* Filters & Search Row */}
      <div className="date-picker-row" style={{ marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div className="form-group" style={{ margin: 0, flex: 1, minWidth: '250px' }}>
          <label className="form-label" htmlFor="feedback-search">Search Feedbacks</label>
          <div className="search-bar" style={{ margin: 0 }}>
            <Search size={16} className="search-bar-icon" />
            <input
              type="text"
              id="feedback-search"
              className="form-input"
              placeholder="Search by customer name, opinion keyword, block..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <div className="form-group" style={{ margin: 0, minWidth: '200px' }}>
          <label className="form-label" htmlFor="feedback-block-filter">Filter by Hostel Block</label>
          <select
            className="form-input"
            value={blockFilter}
            onChange={(e) => setBlockFilter(e.target.value)}
            id="feedback-block-filter"
          >
            <option value="">All Blocks</option>
            {blocks.map(b => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </div>
        {(blockFilter || searchQuery) && (
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => { setBlockFilter(''); setSearchQuery(''); }}
            style={{ marginTop: 'auto' }}
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Feedbacks Grid */}
      {filteredFeedbacks.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="No Feedbacks Found"
          description="No feedbacks match your current search or filters."
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 340px), 1fr))', gap: '1.5rem' }}>
          {filteredFeedbacks.map((item, idx) => (
            <motion.div
              key={item.id}
              className="card-static"
              initial={fadeUp.initial}
              animate={fadeUp.animate}
              transition={{ delay: idx * 0.05 }}
              whileHover={{ y: -3, borderColor: 'var(--primary-500)' }}
              style={{ display: 'flex', flexDirection: 'column', gap: '1rem', transition: 'border-color var(--transition-fast)' }}
            >
              {/* Header: Customer Info */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <span style={{ fontWeight: '700', fontSize: '1rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <User size={16} className="text-accent-foreground" /> {item.customer?.name || 'Unknown'}
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Phone size={12} /> {item.customer?.phone || 'N/A'}
                  </span>
                </div>
                {item.customer?.hostel_block && (
                  <span style={{ fontSize: '0.75rem', background: 'rgba(249, 115, 22, 0.1)', color: 'var(--primary-400)', border: '1px solid rgba(249, 115, 22, 0.2)', padding: '0.2rem 0.5rem', borderRadius: 'var(--radius-sm)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <MapPin size={10} /> {item.customer.hostel_block}
                  </span>
                )}
              </div>

              {/* Body: Opinion */}
              <p style={{ fontSize: '0.95rem', color: 'var(--text-primary)', lineHeight: '1.5', flexGrow: 1, whiteSpace: 'pre-wrap' }}>
                "{item.opinion}"
              </p>

              {/* Footer: Date */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Calendar size={12} /> {new Date(item.created_at).toLocaleString()}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Feedbacks;
