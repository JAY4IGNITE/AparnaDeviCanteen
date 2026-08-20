import { useState, useEffect } from 'react';
import axios from 'axios';
import { ShieldAlert, Trash2, CheckCircle, AlertCircle, Users, Search } from 'lucide-react';
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
            <option value="F Block">F Block</option>
            <option value="Other">Other</option>
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
          scene={() => import('../../components/3d/NoCustomers3D')}
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
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
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
    </div>
  );
};

export default ManageCustomers;
