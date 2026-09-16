import { useState, useEffect } from 'react';
import axios from 'axios';
import { ShieldAlert, Trash2, CheckCircle, AlertCircle, Users, Search, KeyRound, Edit, X } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import AlertBanner from '../../components/ui/AlertBanner';
import EmptyState from '../../components/ui/EmptyState';
import LoadingState from '../../components/ui/LoadingState';
import MotionButton from '../../components/ui/MotionButton';

const ManageCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [blockFilter, setBlockFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [editFormData, setEditFormData] = useState({ name: '', phone: '', email: '', hostel_block: '' });
  const [editLoading, setEditLoading] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const res = await axios.get('/admin/customers');
      setCustomers(res.data.data);
    } catch (err) {
      console.error('Failed to load customers:', err);
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to load customers list'
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleBlockStatus = async (customer) => {
    try {
      await axios.put(`/admin/customers/${customer.id}/block`);
      setMessage({
        type: 'success',
        text: `Customer ${customer.is_blocked ? 'unblocked' : 'blocked'} successfully!`
      });
      fetchCustomers();
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update customer status' });
    }
  };

  const deleteCustomer = async (customerId) => {
    if (!window.confirm('Are you sure you want to delete this customer? This action is permanent.')) return;
    try {
      await axios.delete(`/admin/customers/${customerId}`);
      setMessage({ type: 'success', text: 'Customer account deleted' });
      fetchCustomers();
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to delete customer' });
    }
  };

  const resetPassword = async (customer) => {
    if (!window.confirm(`Are you sure you want to reset ${customer.name}'s password to Reset@123?`)) return;
    try {
      const res = await axios.put(`/admin/customers/${customer.id}/reset-password`);
      setMessage({ type: 'success', text: res.data.message || 'Password reset successfully' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to reset password' });
    }
  };

  const handleEditClick = (customer) => {
    setEditingCustomer(customer);
    setEditFormData({
      name: customer.name || '',
      phone: customer.phone || '',
      email: customer.email || '',
      hostel_block: customer.hostel_block || ''
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    try {
      await axios.put(`/admin/customers/${editingCustomer.id}`, editFormData);
      setMessage({ type: 'success', text: 'Customer details updated successfully!' });
      setEditingCustomer(null);
      fetchCustomers();
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update customer' });
    } finally {
      setEditLoading(false);
    }
  };

  if (loading) {
    return <LoadingState />;
  }

  const filtered = customers
    .filter(cust => !blockFilter || cust.hostel_block === blockFilter)
    .filter(cust => {
      if (!searchQuery) return true;
      const lowerQuery = searchQuery.toLowerCase();
      return (
        (cust.name && cust.name.toLowerCase().includes(lowerQuery)) ||
        (cust.phone && cust.phone.includes(lowerQuery)) ||
        (cust.hostel_block && cust.hostel_block.toLowerCase().includes(lowerQuery))
      );
    });

  return (
    <div>
      <PageHeader
        title="Manage Customers"
        subtitle="View, block, or delete registered customer accounts"
        badge={`${customers.length} ${customers.length === 1 ? 'Customer' : 'Customers'}`}
        showBack={true}
        backTo="/admin/home"
      />

      <AlertBanner type={message.type} show={!!message.text}>
        {message.type === 'success' ? <CheckCircle size={16} style={{ marginRight: '0.5rem', display: 'inline' }} /> : <AlertCircle size={16} style={{ marginRight: '0.5rem', display: 'inline' }} />}
        {message.text}
      </AlertBanner>

      <div className="customer-toolbar">
        <div className="customer-toolbar-left">
          <div className="customer-search-wrap">
            <Search size={16} className="customer-search-icon" />
            <input
              type="text"
              id="customer-search"
              className="customer-search-input"
              placeholder="Search by name, phone, or block..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                className="customer-search-clear"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>
          <div className="customer-filter-wrap">
            <select
              className="customer-filter-select"
              value={blockFilter}
              onChange={(e) => setBlockFilter(e.target.value)}
              id="customer-block-filter"
              aria-label="Filter by Hostel Block"
            >
              <option value="">All Hostel Blocks</option>
              <option value="F Block (Old)">F Block (Old)</option>
              <option value="Others(A, B, C, D, F)">Others(A, B, C, D, F)</option>
            </select>
          </div>
        </div>

        <div className="customer-toolbar-right">
          <span className="customer-results-count">
            Showing <strong>{filtered.length}</strong> of {customers.length} customers
          </span>
          {(blockFilter || searchQuery) && (
            <MotionButton
              className="btn btn-ghost btn-sm customer-clear-btn"
              onClick={() => { setBlockFilter(''); setSearchQuery(''); }}
            >
              Clear Filters
            </MotionButton>
          )}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No customers found"
          description="No customers match your current search or filters."
        />
      ) : (
        <div className="customer-table-wrapper">
          <table className="customer-table table-responsive-cards">
            <thead>
              <tr>
                <th style={{ minWidth: '180px' }}>Customer Name</th>
                <th style={{ minWidth: '120px' }}>Phone</th>
                <th style={{ minWidth: '220px' }}>Email</th>
                <th style={{ minWidth: '150px' }}>Hostel Block</th>
                <th style={{ minWidth: '95px' }}>Status</th>
                <th style={{ minWidth: '115px' }}>Joined Date</th>
                <th style={{ minWidth: '160px', width: '160px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((cust) => (
                <tr key={cust.id}>
                  <td data-label="Customer Name">
                    <div className="customer-name-cell">
                      <div className="customer-avatar-badge" aria-hidden="true">
                        {cust.name ? cust.name.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <span className="customer-name-text">{cust.name}</span>
                    </div>
                  </td>
                  <td data-label="Phone" className="customer-phone-cell">
                    {cust.phone}
                  </td>
                  <td data-label="Email">
                    {cust.email ? (
                      <div className="customer-email-cell" title={cust.email}>
                        <span className="customer-email-text">{cust.email}</span>
                        {cust.email_verified ? (
                          <CheckCircle size={14} className="email-status-icon verified" title="Verified" />
                        ) : (
                          <AlertCircle size={14} className="email-status-icon unverified" title="Unverified" />
                        )}
                      </div>
                    ) : (
                      <span className="text-muted">—</span>
                    )}
                  </td>
                  <td data-label="Hostel Block">
                    <span className="customer-block-chip">{cust.hostel_block || '—'}</span>
                  </td>
                  <td data-label="Status">
                    <span className={`badge ${cust.is_blocked ? 'badge-blocked' : 'badge-active'}`}>
                      <span className="status-dot" />
                      {cust.is_blocked ? 'Blocked' : 'Active'}
                    </span>
                  </td>
                  <td data-label="Joined Date" className="customer-date-cell">
                    {new Date(cust.created_at).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </td>
                  <td data-label="Actions" style={{ textAlign: 'right' }}>
                    <div className="customer-actions-group">
                      <MotionButton
                        className="customer-action-btn edit"
                        onClick={() => handleEditClick(cust)}
                        title="Edit Customer Details"
                        aria-label={`Edit ${cust.name}`}
                      >
                        <Edit size={15} />
                      </MotionButton>
                      <MotionButton
                        className={`customer-action-btn ${cust.is_blocked ? 'unblock' : 'block'}`}
                        onClick={() => toggleBlockStatus(cust)}
                        title={cust.is_blocked ? 'Unblock Customer Account' : 'Block Customer Account'}
                        aria-label={cust.is_blocked ? `Unblock ${cust.name}` : `Block ${cust.name}`}
                      >
                        <ShieldAlert size={15} />
                      </MotionButton>
                      <MotionButton
                        className="customer-action-btn reset"
                        onClick={() => resetPassword(cust)}
                        title="Reset Password to Reset@123"
                        aria-label={`Reset password for ${cust.name}`}
                      >
                        <KeyRound size={15} />
                      </MotionButton>
                      <MotionButton
                        className="customer-action-btn delete"
                        onClick={() => deleteCustomer(cust.id)}
                        title="Delete Customer Permanently"
                        aria-label={`Delete ${cust.name}`}
                      >
                        <Trash2 size={15} />
                      </MotionButton>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Customer Modal */}
      {editingCustomer && (
        <div className="modal-overlay" style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          backdropFilter: 'blur(4px)'
        }}>
          <div className="modal-content" style={{
            background: 'var(--bg-surface)', padding: '2rem', borderRadius: '1rem',
            width: '90%', maxWidth: '500px', position: 'relative',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            border: '1px solid var(--border-light)'
          }}>
            <button 
              onClick={() => setEditingCustomer(null)}
              style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
            >
              <X size={20} />
            </button>
            <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)', fontSize: '1.25rem', fontWeight: 600 }}>Edit Customer</h3>
            
            <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Name</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={editFormData.phone}
                  onChange={(e) => setEditFormData({...editFormData, phone: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input 
                  type="email" 
                  className="form-input" 
                  value={editFormData.email}
                  onChange={(e) => setEditFormData({...editFormData, email: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Hostel Block</label>
                <select 
                  className="form-input"
                  value={editFormData.hostel_block}
                  onChange={(e) => setEditFormData({...editFormData, hostel_block: e.target.value})}
                  required
                >
                  <option value="">Select Block</option>
                  <option value="F Block (Old)">F Block (Old)</option>
                  <option value="Others(A, B, C, D, F)">Others(A, B, C, D, F)</option>
                </select>
              </div>
              
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', justifyContent: 'flex-end' }}>
                <MotionButton
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setEditingCustomer(null)}
                >
                  Cancel
                </MotionButton>
                <MotionButton
                  type="submit"
                  className="btn btn-primary"
                  disabled={editLoading}
                >
                  {editLoading ? 'Saving...' : 'Save Changes'}
                </MotionButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageCustomers;