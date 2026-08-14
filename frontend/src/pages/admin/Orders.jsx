import { useState, useEffect } from 'react';
import axios from 'axios';
import { Download, CheckCircle, Clock, Package } from 'lucide-react';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchOrders();
  }, [dateFilter, statusFilter]);

  const fetchOrders = async () => {
    try {
      let url = '/admin/orders?';
      if (dateFilter) url += `date=${dateFilter}&`;
      if (statusFilter) url += `status=${statusFilter}&`;
      const res = await axios.get(url);
      setOrders(res.data.data);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId, status) => {
    try {
      await axios.put(`/admin/orders/${orderId}`, { status });
      fetchOrders();
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const downloadExcel = async () => {
    try {
      let url = '/admin/orders/export?';
      if (dateFilter) url += `date=${dateFilter}`;
      const res = await axios.get(url, { responseType: 'blob' });
      const blob = new Blob([res.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `orders_${dateFilter || 'all'}.xlsx`;
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (err) {
      console.error('Failed to download:', err);
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });
  };

  if (loading) {
    return <div className="loading-spinner"><div className="spinner"></div></div>;
  }

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1>Orders</h1>
          <p>View and manage all customer orders</p>
        </div>
        <button className="btn btn-secondary" onClick={downloadExcel} id="download-excel">
          <Download size={18} /> Download Excel
        </button>
      </div>

      {/* Filters */}
      <div className="date-picker-row">
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label">Filter by Date</label>
          <input
            type="date"
            className="form-input"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            id="order-date-filter"
          />
        </div>
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label">Filter by Status</label>
          <select
            className="form-input"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            id="order-status-filter"
          >
            <option value="">All</option>
            <option value="Pending">Pending</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
        {(dateFilter || statusFilter) && (
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => { setDateFilter(''); setStatusFilter(''); }}
            style={{ marginTop: 'auto' }}
          >
            Clear Filters
          </button>
        )}
      </div>

      {orders.length === 0 ? (
        <div className="empty-state">
          <Package size={64} />
          <h3>No orders found</h3>
          <p>Try adjusting your filters.</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Phone</th>
                <th>Block</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order._id}>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                    #{order._id.slice(-8).toUpperCase()}
                  </td>
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                    {order.customer?.name || 'N/A'}
                  </td>
                  <td>{order.customer?.phone || 'N/A'}</td>
                  <td>{order.customer?.hostelBlock || '—'}</td>
                  <td style={{ maxWidth: '200px' }}>
                    {order.items.map(i => `${i.itemName}×${i.quantity}`).join(', ')}
                  </td>
                  <td style={{ color: 'var(--primary-400)', fontWeight: 600 }}>₹{order.totalAmount}</td>
                  <td>
                    <span className={`badge badge-${order.status.toLowerCase()}`}>
                      {order.status}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.85rem' }}>{formatDate(order.createdAt)}</td>
                  <td>
                    {order.status === 'Pending' ? (
                      <button
                        className="btn btn-success btn-sm"
                        onClick={() => updateStatus(order._id, 'Completed')}
                        title="Mark as Completed"
                      >
                        <CheckCircle size={14} />
                      </button>
                    ) : (
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => updateStatus(order._id, 'Pending')}
                        title="Revert to Pending"
                      >
                        <Clock size={14} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
