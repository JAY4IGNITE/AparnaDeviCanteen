import { useState } from 'react';
import axios from 'axios';
import { DollarSign, Calendar, ShoppingBag } from 'lucide-react';

const Revenue = () => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchRevenue = async () => {
    if (!date) return;
    setLoading(true);
    try {
      const res = await axios.get(`/admin/revenue?date=${date}`);
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
        <p>Check daily revenue for any date</p>
      </div>

      <div className="date-picker-row">
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label">Select Date</label>
          <input
            type="date"
            className="form-input"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            id="revenue-date"
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
            <div className="revenue-label">Total Revenue on {data.date}</div>
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
