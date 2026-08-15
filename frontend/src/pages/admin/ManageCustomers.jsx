import { useState, useEffect } from 'react';
import axios from 'axios';
import { ShieldAlert, Trash2, CheckCircle, AlertCircle, Users } from 'lucide-react';

const ManageCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [blockFilter, setBlockFilter] = useState('');

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const res = await axios.get('/admin/customers');
      setCustomers(res.data.data);
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to load customers list' });
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

  if (loading) {
    return <div className="loading-spinner"><div className="spinner"></div></div>;
  }

  return (
    <div>
      <div className="page-header">
        <h1>Manage Customers</h1>
        <p>View, block, or delete registered customer accounts</p>
      </div>

      {message.text && (
        <div className={`alert alert-${message.type}`}>
          {message.type === 'success' ? <CheckCircle size={16} style={{ marginRight: '0.5rem', display: 'inline' }} /> : <AlertCircle size={16} style={{ marginRight: '0.5rem', display: 'inline' }} />}
          {message.text}
        </div>
      )}

      <div className="date-picker-row" style={{ marginBottom: '1.5rem' }}>
        <div className="form-group" style={{ margin: 0, minWidth: '200px' }}>
          <label className="form-label">Filter by Block</label>
          <select
            className="form-input"
            value={blockFilter}
            onChange={(e) => setBlockFilter(e.target.value)}
            id="customer-block-filter"
          >
            <option value="">All Blocks</option>
            <option value="F Block">F Block</option>
            <option value="Other">Other</option>
          </select>
        </div>
        {blockFilter && (
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => setBlockFilter('')}
            style={{ marginTop: 'auto' }}
          >
            Clear Filter
          </button>
        )}
      </div>

      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>Hostel Block</th>
              <th>Status</th>
              <th>Joined Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {customers
              .filter(cust => !blockFilter || cust.hostel_block === blockFilter)
              .map((cust) => (
              <tr key={cust.id}>
                <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{cust.name}</td>
                <td>{cust.phone}</td>
                <td>{cust.hostel_block || '—'}</td>
                <td>
                  <span className={`badge ${cust.is_blocked ? 'badge-blocked' : 'badge-active'}`}>
                    {cust.is_blocked ? 'Blocked' : 'Active'}
                  </span>
                </td>
                <td style={{ fontSize: '0.85rem' }}>
                  {new Date(cust.created_at).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => toggleBlockStatus(cust)}
                      style={{ color: cust.is_blocked ? 'var(--success)' : 'var(--warning)', borderColor: cust.is_blocked ? 'rgba(34, 197, 94, 0.2)' : 'rgba(234, 179, 8, 0.2)' }}
                      title={cust.is_blocked ? 'Unblock' : 'Block'}
                    >
                      <ShieldAlert size={14} /> {cust.is_blocked ? 'Unblock' : 'Block'}
                    </button>
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => deleteCustomer(cust.id)}
                      style={{ color: 'var(--danger)' }}
                      title="Delete Permanently"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {customers.filter(cust => !blockFilter || cust.hostel_block === blockFilter).length === 0 && (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  No registered customers found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageCustomers;
