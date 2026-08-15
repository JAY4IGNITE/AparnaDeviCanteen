import { useState } from 'react';
import axios from 'axios';
import { Calendar, BarChart3, Package } from 'lucide-react';

const Statistics = () => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [block, setBlock] = useState('');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);

  const fetchStats = async () => {
    if (!date) return;
    setLoading(true);
    try {
      let url = `/admin/statistics?date=${date}`;
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
      <div className="page-header">
        <h1>Item Statistics</h1>
        <p>Analyze quantity ordered for each menu item on a specific day</p>
      </div>

      <div className="date-picker-row">
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label">Select Date</label>
          <input
            type="date"
            className="form-input"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            id="stats-date"
          />
        </div>
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label">Filter by Block</label>
          <select
            className="form-input"
            value={block}
            onChange={(e) => setBlock(e.target.value)}
            id="stats-block"
          >
            <option value="">All Blocks</option>
            <option value="F Block">F Block</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <button className="btn btn-primary" onClick={fetchStats} style={{ marginTop: 'auto' }} id="get-stats">
          <Calendar size={18} /> Get Statistics
        </button>
      </div>

      {loading && <div className="loading-spinner"><div className="spinner"></div></div>}

      {fetched && !loading && (
        <div className="table-wrapper">
          <table className="table">
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
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{item._id}</td>
                  <td style={{ fontWeight: 600 }}>{item.totalQuantity} units</td>
                  <td style={{ color: 'var(--success)', fontWeight: 600 }}>₹{item.totalRevenue}</td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan="3" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No orders placed on this date.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Statistics;
