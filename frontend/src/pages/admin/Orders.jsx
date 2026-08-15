import { useState, useEffect } from 'react';
import axios from 'axios';
import { Download, CheckCircle, Clock, Package, Phone, Trash2, Search, X } from 'lucide-react';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [blockFilter, setBlockFilter] = useState('');
  const [orderIdFilter, setOrderIdFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

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

  const clearAllOrders = async () => {
    if (!window.confirm('⚠️ Are you sure you want to delete ALL orders? This action is permanent and cannot be undone.')) return;
    try {
      await axios.delete('/admin/orders');
      setOrders([]);
    } catch (err) {
      console.error('Failed to clear orders:', err);
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
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button className="btn btn-secondary" onClick={downloadExcel} id="download-excel">
            <Download size={18} /> Download Excel
          </button>
          <button className="btn btn-ghost" onClick={clearAllOrders} id="clear-all-orders" style={{ color: 'var(--danger)', borderColor: 'rgba(239,68,68,0.3)' }}>
            <Trash2 size={18} /> Clear All Orders
          </button>
        </div>
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
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label">Filter by Block</label>
          <select
            className="form-input"
            value={blockFilter}
            onChange={(e) => setBlockFilter(e.target.value)}
            id="order-block-filter"
          >
            <option value="">All Blocks</option>
            <option value="F Block">F Block</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label">Filter by Order ID</label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g. 1"
            value={orderIdFilter}
            onChange={(e) => setOrderIdFilter(e.target.value)}
            id="order-id-filter"
            style={{ width: '120px' }}
          />
        </div>
        {(dateFilter || statusFilter || blockFilter || orderIdFilter || searchQuery) && (
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => { setDateFilter(''); setStatusFilter(''); setBlockFilter(''); setOrderIdFilter(''); setSearchQuery(''); }}
            style={{ marginTop: 'auto' }}
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Universal Search */}
      <div style={{ marginBottom: '1rem', position: 'relative' }}>
        <Search size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
        <input
          type="text"
          className="form-input"
          placeholder="Search by name, phone, block, item, amount, status..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          id="order-universal-search"
          style={{ paddingLeft: '2.5rem', paddingRight: searchQuery ? '2.5rem' : '1rem' }}
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
          >
            <X size={16} />
          </button>
        )}
      </div>

      {(() => {
        const q = searchQuery.toLowerCase();
        const filtered = orders.filter(order => {
          const matchesBlock = !blockFilter || order.customer?.hostel_block === blockFilter;
          const matchesOrderId = !orderIdFilter || String(order.order_number) === orderIdFilter.trim();
          const matchesSearch = !q ||
            (order.customer?.name || '').toLowerCase().includes(q) ||
            String(order.order_number).includes(q) ||
            (order.id || '').toLowerCase().includes(q) ||
            (order.customer?.phone || '').includes(q) ||
            (order.customer?.hostel_block || '').toLowerCase().includes(q) ||
            (order.status || '').toLowerCase().includes(q) ||
            String(order.total_amount).includes(q) ||
            (order.order_items || []).some(i => i.item_name.toLowerCase().includes(q));
          return matchesBlock && matchesOrderId && matchesSearch;
        });
        const sorted = [...filtered].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        return sorted.length === 0 ? (
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
              {sorted.map((order, index) => (
                  <tr key={order.id}>
                    <td style={{ fontWeight: 700, color: 'var(--primary-400)', fontFamily: 'monospace' }}>
                      #{order.order_number}
                    </td>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      {order.customer?.name || 'N/A'}
                    </td>
                    <td>{order.customer?.phone || 'N/A'}</td>
                    <td>{order.customer?.hostel_block || '—'}</td>
                    <td style={{ maxWidth: '200px' }}>
                      {(order.order_items || []).map(i => `${i.item_name}×${i.quantity}`).join(', ')}
                    </td>
                    <td style={{ color: 'var(--primary-400)', fontWeight: 600 }}>₹{order.total_amount}</td>
                    <td>
                      <span className={`badge badge-${order.status.toLowerCase()}`}>
                        {order.status}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.85rem' }}>{formatDate(order.created_at)}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                        {order.status === 'Pending' ? (
                          <button
                            className="btn btn-success btn-sm"
                            onClick={() => updateStatus(order.id, 'Completed')}
                            title="Mark as Completed"
                          >
                            <CheckCircle size={14} />
                          </button>
                        ) : (
                          <button
                            className="btn btn-ghost btn-sm"
                            onClick={() => updateStatus(order.id, 'Pending')}
                            title="Revert to Pending"
                          >
                            <Clock size={14} />
                          </button>
                        )}
                        {order.customer?.phone && (
                          <a
                            href={`tel:${order.customer.phone}`}
                            className="btn btn-secondary btn-sm"
                            title={`Call ${order.customer?.name}`}
                            style={{ color: 'var(--success)' }}
                          >
                            <Phone size={14} />
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
              ))}
            </tbody>
          </table>
        </div>
        );
      })()}
    </div>
  );
};

export default AdminOrders;
