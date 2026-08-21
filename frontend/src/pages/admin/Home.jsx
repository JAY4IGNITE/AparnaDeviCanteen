import { useState, useEffect } from 'react';
import axios from 'axios';
import { ShoppingBag, DollarSign, Clock, CheckCircle } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import StatCard from '../../components/ui/StatCard';
import LoadingState from '../../components/ui/LoadingState';
import Lazy3D from '../../components/3d/Lazy3D';

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
      const activeOrders = orders.filter(o => o.status !== 'Cancelled');
      const pending = orders.filter(o => o.status === 'Pending').length;
      const completed = orders.filter(o => o.status === 'Completed').length;

      setStats({
        totalOrders: activeOrders.length,
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
    return <LoadingState variant="stats" />;
  }

  const statItems = [
    { icon: ShoppingBag, value: stats.totalOrders, label: 'Total Orders', color: 'orange' },
    { icon: DollarSign, value: `₹${stats.totalRevenue}`, label: 'Total Revenue', color: 'green' },
    { icon: Clock, value: stats.pendingOrders, label: 'Pending Orders', color: 'blue' },
    { icon: CheckCircle, value: stats.completedOrders, label: 'Completed Orders', color: 'green' },
  ];

  return (
    <div className="admin-dashboard">
      <div className="dashboard-decoration" aria-hidden="true">
        <Lazy3D
          load={() => import('../../components/3d/DashboardDecoration3D')}
          style={{ width: '100%', height: '100%' }}
          fallback={<></>}
        />
      </div>

      <PageHeader title="Admin Dashboard" subtitle="Overview of all activity" />

      <div className="stats-grid">
        {statItems.map((stat, index) => (
          <StatCard key={stat.label} {...stat} index={index} />
        ))}
      </div>
    </div>
  );
};

export default AdminHome;
