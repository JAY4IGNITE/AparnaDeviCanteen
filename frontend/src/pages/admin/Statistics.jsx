import { useState } from 'react';
import axios from 'axios';
import { motion } from 'motion/react';
import { Calendar, BarChart3 } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import EmptyState from '../../components/ui/EmptyState';
import LoadingState from '../../components/ui/LoadingState';
import MotionButton from '../../components/ui/MotionButton';
import { useMotionSafe } from '../../lib/motion';

const Statistics = () => {
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [block, setBlock] = useState('');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);
  const { reduced, transition } = useMotionSafe();

  const fetchStats = async () => {
    if (!startDate || !endDate) return;
    setLoading(true);
    try {
      let url = `/admin/statistics?startDate=${startDate}&endDate=${endDate}`;
      if (block) url += `&block=${block}`;
      const res = await axios.get(url);
      setItems(res.data.data);
      setFetched(true);
    } catch (err) {
      console.error('Failed to fetch statistics:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHeader title="Item Statistics" subtitle="Analyze quantity ordered for each menu item over a date range" />

      <div className="filter-bar">
        <div className="form-group">
          <label className="form-label">Start Date</label>
          <input type="date" className="form-input" value={startDate} onChange={(e) => setStartDate(e.target.value)} id="stats-start-date" />
        </div>
        <div className="form-group">
          <label className="form-label">End Date</label>
          <input type="date" className="form-input" value={endDate} onChange={(e) => setEndDate(e.target.value)} id="stats-end-date" />
        </div>
        <div className="form-group">
          <label className="form-label">Filter by Block</label>
          <select className="form-input" value={block} onChange={(e) => setBlock(e.target.value)} id="stats-block">
            <option value="">All Blocks</option>
            <option value="F Block">F Block</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <MotionButton className="btn btn-primary" onClick={fetchStats} id="get-stats">
          <Calendar size={18} /> Get Statistics
        </MotionButton>
      </div>

      {loading && <LoadingState />}

      {!fetched && !loading && (
        <EmptyState
          icon={BarChart3}
          title="No statistics yet"
          description="Choose a date range and optional block, then select Get Statistics to see per-item totals."
        />
      )}

      {fetched && !loading && (
        <motion.div
          className="table-wrapper"
          initial={reduced ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={transition}
        >
          <table className="table table-responsive-cards">
            <thead>
              <tr>
                <th>Menu Item</th>
                <th>Total Quantity Ordered</th>
                <th>Total Revenue Generated</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item._id}>
                  <td data-label="Menu Item" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{item._id}</td>
                  <td data-label="Quantity" style={{ fontWeight: 600 }}>{item.totalQuantity} units</td>
                  <td data-label="Revenue" style={{ color: 'var(--success)', fontWeight: 600 }}>₹{item.totalRevenue}</td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan="3" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No orders placed in this date range.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </motion.div>
      )}
    </div>
  );
};

export default Statistics;
