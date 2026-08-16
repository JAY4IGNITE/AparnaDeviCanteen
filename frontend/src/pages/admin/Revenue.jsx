import { useState } from 'react';
import axios from 'axios';
import { DollarSign, Calendar, ShoppingBag } from 'lucide-react';

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
      <div className="page-header">
        <h1>Revenue</h1>
        <p>Check revenue for a date range</p>
      </div>

      <div className="date-picker-row">
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label">Start Date</label>
          <input
            type="date"
            className="form-input"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            id="revenue-start-date"
          />
        </div>
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label">End Date</label>
          <input
            type="date"
            className="form-input"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            id="revenue-end-date"
          />
        </div>
        <button className="btn btn-primary" onClick={fetchRevenue} style={{ marginTop: 'auto' }} id="fetch-revenue">
          <Calendar size={18} /> Get Revenue
        </button>
      </div>

      {loading && <div className="loading-spinner"><div className="spinner"></div></div>}

      {data && !loading && (
        <div className="card-static">
          <div className="revenue-display">
            <div className="revenue-amount">₹{data.totalRevenue}</div>
            <div className="revenue-label">
              Total Revenue {data.startDate === data.endDate ? `on ${data.startDate}` : `from ${data.startDate} to ${data.endDate}`}
            </div>
          </div>

          <div className="stats-grid" style={{ maxWidth: '400px', margin: '1.5rem auto 0' }}>
            <div className="stat-card">
              <div className="stat-icon orange">
                <ShoppingBag size={24} />
              </div>
              <div>
                <div className="stat-value">{data.orderCount}</div>
                <div className="stat-label">Total Orders</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon green">
                <DollarSign size={24} />
              </div>
              <div>
                <div className="stat-value">
                  ₹{data.orderCount > 0 ? Math.round(data.totalRevenue / data.orderCount) : 0}
                </div>
                <div className="stat-label">Avg. Order Value</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Revenue;
