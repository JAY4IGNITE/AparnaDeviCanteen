import { useState, useEffect } from 'react';
import axios from 'axios';
import { Download, CheckCircle, Clock, Package, Phone, Trash2, Search, X } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import EmptyState from '../../components/ui/EmptyState';
import LoadingState from '../../components/ui/LoadingState';
import MotionButton from '../../components/ui/MotionButton';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startDateFilter, setStartDateFilter] = useState('');
  const [endDateFilter, setEndDateFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [blockFilter, setBlockFilter] = useState('');
  const [orderIdFilter, setOrderIdFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchOrders();
  }, [startDateFilter, endDateFilter, statusFilter]);

  const fetchOrders = async () => {
    try {
      let url = '/admin/orders?';
      if (startDateFilter && endDateFilter) url += `startDate=${startDateFilter}&endDate=${endDateFilter}&`;
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
      if (startDateFilter && endDateFilter) url += `startDate=${startDateFilter}&endDate=${endDateFilter}`;
      const res = await axios.get(url, { responseType: 'blob' });
      const blob = new Blob([res.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `orders_${startDateFilter ? startDateFilter + '_to_' + endDateFilter : 'all'}.xlsx`;
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
  const sorted = [...filtered].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  if (loading) {
    return <LoadingState />;
  }

  return (
    <div>
      <PageHeader
        title="Orders"
        subtitle="View and manage all customer orders"
        actions={
          <>
            <MotionButton className="btn btn-secondary" onClick={downloadExcel} id="download-excel">
              <Download size={18} /> Download Excel
            </MotionButton>
            <MotionButton className="btn btn-ghost" onClick={clearAllOrders} id="clear-all-orders" style={{ color: 'var(--danger)', borderColor: 'rgba(239,68,68,0.3)' }}>
              <Trash2 size={18} /> Clear All Orders
            </MotionButton>
          </>
        }
      />

      <div className="filter-bar">
        <div className="form-group">
          <label className="form-label">Start Date</label>
          <input type="date" className="form-input" value={startDateFilter} onChange={(e) => setStartDateFilter(e.target.value)} id="order-start-date-filter" />
        </div>
        <div className="form-group">
          <label className="form-label">End Date</label>
          <input type="date" className="form-input" value={endDateFilter} onChange={(e) => setEndDateFilter(e.target.value)} id="order-end-date-filter" />
        </div>
        <div className="form-group">
          <label className="form-label">Filter by Status</label>
          <select className="form-input" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} id="order-status-filter">
            <option value="">All</option>
            <option value="Pending">Pending</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Filter by Block</label>
          <select className="form-input" value={blockFilter} onChange={(e) => setBlockFilter(e.target.value)} id="order-block-filter">
            <option value="">All Blocks</option>
            <option value="F Block">F Block</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Filter by Order ID</label>
          <input type="text" className="form-input" placeholder="e.g. 1" value={orderIdFilter} onChange={(e) => setOrderIdFilter(e.target.value)} id="order-id-filter" style={{ width: '120px' }} />
        </div>
        {(startDateFilter || endDateFilter || statusFilter || blockFilter || orderIdFilter || searchQuery) && (
          <MotionButton className="btn btn-ghost btn-sm" onClick={() => { setStartDateFilter(''); setEndDateFilter(''); setStatusFilter(''); setBlockFilter(''); setOrderIdFilter(''); setSearchQuery(''); }}>
            Clear Filters
          </MotionButton>
        )}
      </div>

      <div className="search-bar">
        <Search size={16} className="search-bar-icon" />
        <input
          type="text"
          className="form-input"
          placeholder="Search by name, phone, block, item, amount, status..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          id="order-universal-search"
          style={{ paddingRight: searchQuery ? '2.5rem' : '1rem' }}
        />
        {searchQuery && (
          <button type="button" className="search-bar-clear" onClick={() => setSearchQuery('')}>
            <X size={16} />
          </button>
        )}
      </div>

      {sorted.length === 0 ? (
        <EmptyState icon={Package} title="No orders found" description="Try adjusting your filters." />
      ) : (
        <div className="table-wrapper">
          <table className="table table-responsive-cards">
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
              {sorted.map((order) => (
                <tr key={order.id}>
                  <td data-label="Order ID" style={{ fontWeight: 700, color: 'var(--primary-400)', fontFamily: 'monospace' }} title={`Full ID: ${order.id}`}>
                    #{order.order_number}
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 400, marginTop: '0.15rem' }}>
                      {order.id.substring(0, 8)}
                    </div>
                  </td>
                  <td data-label="Customer" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                    {order.customer?.name || 'N/A'}
                  </td>
                  <td data-label="Phone">{order.customer?.phone || 'N/A'}</td>
                  <td data-label="Block">{order.customer?.hostel_block || '—'}</td>
                  <td data-label="Items" style={{ maxWidth: '200px' }}>
                    {(order.order_items || []).map(i => `${i.item_name}×${i.quantity}`).join(', ')}
                  </td>
                  <td data-label="Total" style={{ color: 'var(--primary-400)', fontWeight: 600 }}>₹{order.total_amount}</td>
                  <td data-label="Status">
                    <span className={`badge badge-${order.status.toLowerCase()}`}>{order.status}</span>
                  </td>
                  <td data-label="Date" style={{ fontSize: '0.85rem' }}>{formatDate(order.created_at)}</td>
                  <td data-label="Action">
                    <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center', flexWrap: 'nowrap', whiteSpace: 'nowrap' }}>
                      {order.status === 'Pending' ? (
                        <MotionButton className="btn btn-success btn-sm" onClick={() => updateStatus(order.id, 'Completed')} title="Mark as Completed">
                          <CheckCircle size={14} />
                        </MotionButton>
                      ) : (
                        <MotionButton className="btn btn-ghost btn-sm" onClick={() => updateStatus(order.id, 'Pending')} title="Revert to Pending">
                          <Clock size={14} />
                        </MotionButton>
                      )}
                      {order.status !== 'Cancelled' && (
                        <MotionButton
                          className="btn btn-danger btn-sm"
                          onClick={() => { if (window.confirm('Are you sure?')) updateStatus(order.id, 'Cancelled'); }}
                          title="Cancel (Delete) Order"
                          id={`delete-order-${order.id}`}
                        >
                          <Trash2 size={14} />
                        </MotionButton>
                      )}
                      {order.customer?.phone && (
                        <a href={`tel:${order.customer.phone}`} className="btn btn-secondary btn-sm" title={`Call ${order.customer?.name}`} style={{ color: 'var(--success)' }}>
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
      )}
    </div>
  );
};

export default AdminOrders;
