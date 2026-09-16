import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'motion/react';
import { DollarSign, Calendar, ShoppingBag, TrendingUp } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import StatCard from '../../components/ui/StatCard';
import EmptyState from '../../components/ui/EmptyState';
import LoadingState from '../../components/ui/LoadingState';
import MotionButton from '../../components/ui/MotionButton';
import { useMotionSafe } from '../../lib/motion';

const Revenue = () => {
  const todayStr = new Date().toISOString().split('T')[0];
  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState(todayStr);
  const [activePreset, setActivePreset] = useState('today');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { reduced, transition, spring } = useMotionSafe();

  useEffect(() => {
    // Automatically load today's revenue on mount
    fetchRevenue(todayStr, todayStr);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchRevenue = async (start = startDate, end = endDate) => {
    if (!start || !end) return;
    setLoading(true);
    try {
      const res = await axios.get(`/admin/revenue?startDate=${start}&endDate=${end}`);
      setData(res.data.data);
    } catch (err) {
      console.error('Failed to fetch revenue:', err);
    } finally {
      setLoading(false);
    }
  };

  const applyPreset = (preset) => {
    setActivePreset(preset);
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    let start = today;
    let end = today;

    if (preset === 'today') {
      start = today;
      end = today;
    } else if (preset === 'yesterday') {
      const y = new Date(now);
      y.setDate(y.getDate() - 1);
      start = y.toISOString().split('T')[0];
      end = start;
    } else if (preset === 'last7') {
      const d7 = new Date(now);
      d7.setDate(d7.getDate() - 6);
      start = d7.toISOString().split('T')[0];
      end = today;
    } else if (preset === 'month') {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      start = firstDay.toISOString().split('T')[0];
      end = today;
    } else if (preset === 'all') {
      start = '2024-01-01';
      end = today;
    }

    setStartDate(start);
    setEndDate(end);
    fetchRevenue(start, end);
  };

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    setActivePreset('custom');
    fetchRevenue(startDate, endDate);
  };

  return (
    <div>
      <PageHeader 
        title="Revenue & Earnings" 
        subtitle="Monitor sales totals, order counts, and average order value across custom date ranges" 
        showBack={true}
        backTo="/admin/home"
      />

      {/* Preset Quick-Picks */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600, marginRight: '0.25rem' }}>
          Quick Range:
        </span>
        {[
          { key: 'today', label: 'Today' },
          { key: 'yesterday', label: 'Yesterday' },
          { key: 'last7', label: 'Last 7 Days' },
          { key: 'month', label: 'This Month' },
          { key: 'all', label: 'All Time' },
        ].map((p) => (
          <MotionButton
            key={p.key}
            type="button"
            className={`btn btn-sm ${activePreset === p.key ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => applyPreset(p.key)}
          >
            {p.label}
          </MotionButton>
        ))}
      </div>

      {/* Custom Date Filters */}
      <form className="filter-bar" onSubmit={handleCustomSubmit}>
        <div className="form-group">
          <label className="form-label">Start Date</label>
          <input 
            type="date" 
            className="form-input" 
            value={startDate} 
            onChange={(e) => { setStartDate(e.target.value); setActivePreset('custom'); }} 
            id="revenue-start-date" 
          />
        </div>
        <div className="form-group">
          <label className="form-label">End Date</label>
          <input 
            type="date" 
            className="form-input" 
            value={endDate} 
            onChange={(e) => { setEndDate(e.target.value); setActivePreset('custom'); }} 
            id="revenue-end-date" 
          />
        </div>
        <MotionButton type="submit" className="btn btn-primary" id="fetch-revenue">
          <Calendar size={18} /> Apply Range
        </MotionButton>
      </form>

      {loading && <LoadingState />}

      {!data && !loading && (
        <EmptyState
          icon={DollarSign}
          title="Pick a date range"
          description="Choose a start and end date, then select Apply Range to see totals for that period."
        />
      )}

      {data && !loading && (
        <motion.div
          className="card-static"
          initial={reduced ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={transition}
          style={{ marginTop: '1.5rem' }}
        >
          <div className="revenue-hero">
            <motion.div
              className="revenue-amount"
              initial={reduced ? false : { opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={spring}
            >
              ₹{data.totalRevenue}
            </motion.div>
            <div className="revenue-label">
              Total Revenue {data.startDate === data.endDate ? `on ${data.startDate}` : `from ${data.startDate} to ${data.endDate}`}
            </div>
          </div>

          <div className="stats-grid" style={{ maxWidth: '460px', margin: '1.75rem auto 0' }}>
            <StatCard 
              icon={ShoppingBag} 
              value={data.orderCount} 
              label="Total Orders" 
              color="orange" 
              index={0} 
            />
            <StatCard
              icon={TrendingUp}
              value={`₹${data.orderCount > 0 ? Math.round(data.totalRevenue / data.orderCount) : 0}`}
              label="Avg. Order Value"
              color="green"
              index={1}
            />
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Revenue;
