import { useState, useEffect } from 'react';
import axios from 'axios';
import { ShoppingBag, DollarSign, Clock, CheckCircle } from 'lucide-react';

const AdminHome = () => {
  const [stats, setStats] = useState({ totalOrders: 0, totalRevenue: 0, pendingOrders: 0, completedOrders: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllStats();
  }, []);

  const fetchAllStats = async () => {
    try {
      const [ordersRes, revenueRes] = await Promise.all([
        axios.get(`/admin/orders`),
        axios.get(`/admin/revenue`)
      ]);

      const orders = ordersRes.data.data;
      const pending = orders.filter(o => o.status === 'Pending').length;
      const completed = orders.filter(o => o.status === 'Completed').length;

      setStats({
        totalOrders: orders.length,
        totalRevenue: revenueRes.data.data.totalRevenue,
        pendingOrders: pending,
        completedOrders: completed
      });
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading-spinner"><div className="spinner"></div></div>;
  }

  return (
    <div>
      <div className="page-header">
        <h1>Admin Dashboard</h1>
        <p>Overview of all activity</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon orange">
            <ShoppingBag size={24} />
          </div>
          <div>
            <div className="stat-value">{stats.totalOrders}</div>
            <div className="stat-label">Total Orders</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon green">
            <DollarSign size={24} />
          </div>
          <div>
            <div className="stat-value">₹{stats.totalRevenue}</div>
            <div className="stat-label">Total Revenue</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon blue">
            <Clock size={24} />
          </div>
          <div>
            <div className="stat-value">{stats.pendingOrders}</div>
            <div className="stat-label">Pending Orders</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon green">
            <CheckCircle size={24} />
          </div>
          <div>
            <div className="stat-value">{stats.completedOrders}</div>
            <div className="stat-label">Completed Orders</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminHome;
