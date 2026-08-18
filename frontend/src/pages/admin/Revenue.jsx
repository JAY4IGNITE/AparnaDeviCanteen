import { useState } from 'react';
import axios from 'axios';
import { motion } from 'motion/react';
import { DollarSign, Calendar, ShoppingBag } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import StatCard from '../../components/ui/StatCard';
import LoadingState from '../../components/ui/LoadingState';
import MotionButton from '../../components/ui/MotionButton';

const Revenue = () => {
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchRevenue = async () => {
    if (!startDate || !endDate) return;
    setLoading(true);
    try {
      const res = await axios.get(`/admin/revenue?startDate=${startDate}&endDate=${endDate}`);
      setData(res.data.data);
    } catch (err) {
      console.error('Failed to fetch revenue:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHeader title="Revenue" subtitle="Check revenue for a date range" />

      <div className="filter-bar">
        <div className="form-group">
          <label className="form-label">Start Date</label>
          <input type="date" className="form-input" value={startDate} onChange={(e) => setStartDate(e.target.value)} id="revenue-start-date" />
        </div>
        <div className="form-group">
          <label className="form-label">End Date</label>
          <input type="date" className="form-input" value={endDate} onChange={(e) => setEndDate(e.target.value)} id="revenue-end-date" />
        </div>
        <MotionButton className="btn btn-primary" onClick={fetchRevenue} id="fetch-revenue">
          <Calendar size={18} /> Get Revenue
        </MotionButton>
      </div>

      {loading && <LoadingState />}

      {data && !loading && (
        <motion.div
          className="card-static"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="revenue-hero">
            <motion.div
              className="revenue-amount"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            >
              ₹{data.totalRevenue}
            </motion.div>
            <div className="revenue-label">
              Total Revenue {data.startDate === data.endDate ? `on ${data.startDate}` : `from ${data.startDate} to ${data.endDate}`}
            </div>
          </div>

          <div className="stats-grid" style={{ maxWidth: '400px', margin: '1.5rem auto 0' }}>
            <StatCard icon={ShoppingBag} value={data.orderCount} label="Total Orders" color="orange" index={0} />
            <StatCard
              icon={DollarSign}
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
