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
      setMessage({ type: 'error', text: 'Failed to update customer status' });
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
      setMessage({ type: 'error', text: 'Failed to delete customer' });
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
      />

      <AlertBanner type={message.type} show={!!message.text}>
        {message.type === 'success' ? <CheckCircle size={16} style={{ marginRight: '0.5rem', display: 'inline' }} /> : <AlertCircle size={16} style={{ marginRight: '0.5rem', display: 'inline' }} />}
        {message.text}
      </AlertBanner>

      <div className="filter-bar">
        <div className="form-group" style={{ flex: 1, minWidth: '250px' }}>
          <label className="form-label" htmlFor="customer-search">Universal Search</label>
          <div className="search-bar" style={{ margin: 0 }}>
            <Search size={16} className="search-bar-icon" />
            <input
              type="text"
              id="customer-search"
              className="form-input"
              placeholder="Search by name, phone, or block..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <div className="form-group" style={{ minWidth: '200px' }}>
          <label className="form-label" htmlFor="customer-block-filter">Filter by Block</label>
          <select
            className="form-input"
            value={blockFilter}
            onChange={(e) => setBlockFilter(e.target.value)}
            id="customer-block-filter"
          >
            <option value="">All Blocks</option>
            <option value="F Block (Old)">F Block (Old)</option>
            <option value="Others(A, B, C, D, F)">Others(A, B, C, D, F)</option>
          </select>
        </div>
        {(blockFilter || searchQuery) && (
          <MotionButton
            className="btn btn-ghost btn-sm"
            onClick={() => { setBlockFilter(''); setSearchQuery(''); }}
            style={{ marginTop: 'auto' }}
          >
            Clear Filters
          </MotionButton>
        )}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No customers found"
          description="No customers match your current search or filters."
        />
      ) : (
        <div className="table-wrapper">
          <table className="table table-responsive-cards">
            <thead>
              <tr>
                <th>Name</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Hostel Block</th>
                <th>Status</th>
                <th>Joined Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((cust) => (
                <tr key={cust.id}>
                  <td data-label="Name" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{cust.name}</td>
                  <td data-label="Phone">{cust.phone}</td>
                  <td data-label="Email">
                    {cust.email ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        {cust.email} 
                        {cust.email_verified ? <CheckCircle size={14} color="var(--success)" title="Verified" /> : <AlertCircle size={14} color="var(--warning)" title="Unverified" />}
                      </div>
                    ) : '—'}
                  </td>
                  <td data-label="Block">{cust.hostel_block || '—'}</td>
                  <td data-label="Status">
                    <span className={`badge ${cust.is_blocked ? 'badge-blocked' : 'badge-active'}`}>
                      {cust.is_blocked ? 'Blocked' : 'Active'}
                    </span>
                  </td>
                  <td data-label="Joined" style={{ fontSize: '0.85rem' }}>
                    {new Date(cust.created_at).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                  </td>
                  <td data-label="Actions">
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <MotionButton
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleEditClick(cust)}
                        style={{ color: 'var(--primary)', borderColor: 'rgba(59, 130, 246, 0.2)' }}
                        title="Edit Customer"
                        aria-label={`Edit ${cust.name}`}
                      >
                        <Edit size={14} /> Edit
                      </MotionButton>
                      <MotionButton
                        className="btn btn-secondary btn-sm"
                        onClick={() => toggleBlockStatus(cust)}
                        style={{ color: cust.is_blocked ? 'var(--success)' : 'var(--warning)', borderColor: cust.is_blocked ? 'rgba(34, 197, 94, 0.2)' : 'rgba(234, 179, 8, 0.2)' }}
                        title={cust.is_blocked ? 'Unblock' : 'Block'}
                        aria-label={cust.is_blocked ? `Unblock ${cust.name}` : `Block ${cust.name}`}
                      >
                        <ShieldAlert size={14} /> {cust.is_blocked ? 'Unblock' : 'Block'}
                      </MotionButton>
                      <MotionButton
                        className="btn btn-secondary btn-sm"
                        onClick={() => resetPassword(cust)}
                        style={{ color: '#f97316', borderColor: 'rgba(249, 115, 22, 0.2)' }}
                        title="Reset Password"
                        aria-label={`Reset password for ${cust.name}`}
                      >
                        <KeyRound size={14} /> Reset
                      </MotionButton>
                      <MotionButton
                        className="btn btn-ghost btn-sm"
                        onClick={() => deleteCustomer(cust.id)}
                        style={{ color: 'var(--danger)' }}
                        title="Delete Permanently"
                        aria-label={`Delete ${cust.name}`}
                      >
                        <Trash2 size={14} />
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