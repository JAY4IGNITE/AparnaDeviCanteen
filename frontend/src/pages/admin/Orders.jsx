import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Download, CheckCircle, Clock, Package, Phone, Trash2, Search, X, ChefHat, BellRing, Volume2, MessageCircle } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import EmptyState from '../../components/ui/EmptyState';
import LoadingState from '../../components/ui/LoadingState';
import MotionButton from '../../components/ui/MotionButton';
import AnimatedModal from '../../components/ui/AnimatedModal';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [autoSync, setAutoSync] = useState(true);
  const [startDateFilter, setStartDateFilter] = useState('');
  const [endDateFilter, setEndDateFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [blockFilter, setBlockFilter] = useState('');
  const [orderIdFilter, setOrderIdFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);

  const prevOrdersRef = useRef([]);
  const isFirstLoadRef = useRef(true);

  const handleWhatsAppNotify = (order) => {
    const rawPhone = order.customer?.phone;
    if (!rawPhone) {
      alert('No phone number available for this customer');
      return;
    }

    let cleaned = rawPhone.toString().replace(/\D/g, '');
    if (cleaned.length === 10) {
      cleaned = '91' + cleaned;
    }

    const customerName = order.customer?.name || 'Customer';
    const orderNum = order.order_number || (order.id ? order.id.substring(0, 6).toUpperCase() : 'ORDER');
    const totalAmount = order.total_amount || 0;
    
    let msgText = `👋 *Order Update – AparnaCanteen*\n\nHello ${customerName}! 😊\n\nUpdate regarding your *Order #${orderNum}*.\n*Total Amount:* ₹${totalAmount}\n\n— *AparnaCanteen*`;

    if (order.status === 'Preparing') {
      msgText = `👨‍🍳 *Order Update – AparnaCanteen*\n\nHello ${customerName}! 😊\n\nYour *Order #${orderNum}* is now being *prepared in the kitchen*. 👨‍🍳\n*Total Amount:* ₹${totalAmount}\n\nWe’ll have your order ready and served to you shortly. Thank you for your patience! 🙏\n\n— *AparnaCanteen*`;
    } else if (order.status === 'Completed') {
      msgText = `✅ *Order Completed – AparnaCanteen*\n\nHello ${customerName}! 😊\n\nYour *Order #${orderNum}* has been *successfully completed*. 🎉\n\nThank you for ordering from *AparnaCanteen*! We hope you enjoyed your meal. ❤️\n\nWe look forward to serving you again! 🙏\n\n— *AparnaCanteen*`;
    }

    const encodedMsg = encodeURIComponent(msgText);
    const whatsappUrl = `https://wa.me/${cleaned}?text=${encodedMsg}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };



  useEffect(() => {
    fetchOrders();
  }, [startDateFilter, endDateFilter, statusFilter]);

  // Live Auto-Refresh Interval
  useEffect(() => {
    if (!autoSync) return;
    const interval = setInterval(() => {
      fetchOrders(true);
    }, 10000);
    return () => clearInterval(interval);
  }, [autoSync, startDateFilter, endDateFilter, statusFilter]);

  const fetchOrders = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      let url = '/admin/orders?';
      if (startDateFilter && endDateFilter) url += `startDate=${startDateFilter}&endDate=${endDateFilter}&`;
      if (statusFilter) url += `status=${statusFilter}&`;
      const res = await axios.get(url);
      const fetchedOrders = res.data.data || [];

      // Check if new orders arrived since last poll
      if (!isFirstLoadRef.current) {
        const newIncoming = fetchedOrders.filter(
          order => !prevOrdersRef.current.some(prev => prev.id === order.id)
        );
        // We removed the local alert logic here to rely on the global AdminLayout alert
      }

      prevOrdersRef.current = fetchedOrders;
      isFirstLoadRef.current = false;
      setOrders(fetchedOrders);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      if (!isSilent) setLoading(false);
    }
  };

  const updateStatus = async (orderId, status) => {
    try {
      await axios.put(`/admin/orders/${orderId}`, { status });
      fetchOrders(true);
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleClearClick = () => {
    setIsClearModalOpen(true);
  };

  const clearAllOrders = async () => {
    try {
      await axios.delete('/admin/orders');
      setOrders([]);
      prevOrdersRef.current = [];
      setIsClearModalOpen(false);
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
            <MotionButton
              className={`btn ${autoSync ? 'btn-success' : 'btn-ghost'}`}
              onClick={() => setAutoSync(!autoSync)}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              title={autoSync ? 'Live auto-sync active (checking every 10s)' : 'Live auto-sync paused'}
            >
              <span className={`live-pulse-dot ${autoSync ? 'active' : ''}`} />
              Auto-Sync: {autoSync ? 'ON' : 'OFF'}
            </MotionButton>
            <MotionButton className="btn btn-secondary" onClick={downloadExcel} id="download-excel">
              <Download size={18} /> Download Excel
            </MotionButton>
            <MotionButton className="btn btn-ghost" onClick={handleClearClick} id="clear-all-orders" style={{ color: 'var(--danger)', borderColor: 'rgba(239,68,68,0.3)' }}>
              <Trash2 size={18} /> Clear All Orders
            </MotionButton>
          </div>
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
            <option value="Preparing">Preparing</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Filter by Block</label>
          <select className="form-input" value={blockFilter} onChange={(e) => setBlockFilter(e.target.value)} id="order-block-filter">
            <option value="">All Blocks</option>
            <option value="F Block (Old)">F Block (Old)</option>
            <option value="Others(A, B, C, D, F)">Others(A, B, C, D, F)</option>
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
          <button type="button" className="search-bar-clear" onClick={() => setSearchQuery('')} aria-label="Clear search">
            <X size={16} />
          </button>
        )}
      </div>

      {sorted.length === 0 ? (
        <EmptyState icon={Package} title="No orders found" description="Try adjusting your filters or wait for new orders to arrive!" />
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
                      {order.status === 'Pending' && (
                        <MotionButton
                          className="btn btn-info btn-sm"
                          onClick={() => updateStatus(order.id, 'Preparing')}
                          title="Start Preparing"
                          id={`preparing-order-${order.id}`}
                        >
                          <ChefHat size={14} />
                        </MotionButton>
                      )}
                      {(order.status === 'Pending' || order.status === 'Preparing') && (
                        <MotionButton
                          className="btn btn-success btn-sm"
                          onClick={() => updateStatus(order.id, 'Completed')}
                          title="Mark as Completed"
                          id={`complete-order-${order.id}`}
                        >
                          <CheckCircle size={14} />
                        </MotionButton>
                      )}
                      {order.status === 'Preparing' && (
                        <MotionButton
                          className="btn btn-ghost btn-sm"
                          onClick={() => updateStatus(order.id, 'Pending')}
                          title="Revert to Pending"
                          id={`revert-pending-order-${order.id}`}
                        >
                          <Clock size={14} />
                        </MotionButton>
                      )}
                      {order.status === 'Completed' && (
                        <MotionButton
                          className="btn btn-ghost btn-sm"
                          onClick={() => updateStatus(order.id, 'Preparing')}
                          title="Revert to Preparing"
                          id={`revert-preparing-order-${order.id}`}
                        >
                          <Clock size={14} />
                        </MotionButton>
                      )}
                      {order.status !== 'Cancelled' && (
                        <MotionButton
                          className="btn btn-danger btn-sm"
                          onClick={() => { if (window.confirm('Are you sure you want to cancel this order?')) updateStatus(order.id, 'Cancelled'); }}
                          title="Cancel Order"
                          id={`delete-order-${order.id}`}
                        >
                          <Trash2 size={14} />
                        </MotionButton>
                      )}
                      {order.customer?.phone && (
                        <MotionButton
                          className="btn btn-whatsapp btn-sm"
                          onClick={() => handleWhatsAppNotify(order)}
                          title="Send WhatsApp Notification to Customer"
                          id={`whatsapp-notify-btn-${order.id}`}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                        >
                          <MessageCircle size={14} /> WhatsApp
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

      {/* Confirmation Modal */}
      <AnimatedModal open={isClearModalOpen} onClose={() => setIsClearModalOpen(false)} maxWidth="400px" title="Confirm Delete">
        <div className="modal-header">
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--danger)', margin: 0 }}>
            <Trash2 size={24} /> Delete All Orders?
          </h2>
          <button className="btn btn-ghost btn-sm" style={{ padding: '0.25rem' }} onClick={() => setIsClearModalOpen(false)}>
            <X size={20} />
          </button>
        </div>
        <div style={{ padding: '1.5rem', textAlign: 'center' }}>
          <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: '1.5' }}>
            Are you absolutely sure you want to permanently delete <strong>all</strong> orders from the database? This action cannot be undone.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button className="btn btn-ghost" onClick={() => setIsClearModalOpen(false)} style={{ flex: 1 }}>
              Cancel
            </button>
            <button className="btn btn-danger" onClick={clearAllOrders} style={{ flex: 1 }}>
              Yes, Delete All
            </button>
          </div>
        </div>
      </AnimatedModal>
    </div>
  );
};

export default AdminOrders;
