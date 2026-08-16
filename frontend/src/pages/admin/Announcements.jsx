import { useState, useEffect } from 'react';
import axios from 'axios';
import { Megaphone, Plus, Trash2, Edit2, AlertCircle } from 'lucide-react';

const AdminAnnouncements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [message, setMessage] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get('/admin/announcements');
      if (res.data.success) {
        setAnnouncements(res.data.data);
      } else {
        setError(res.data.message);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch announcements');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    try {
      const url = editingId ? `/admin/announcements/${editingId}` : '/admin/announcements';
      const res = editingId 
        ? await axios.put(url, { message, is_active: isActive })
        : await axios.post(url, { message, is_active: isActive });
      
      if (res.data.success) {
        setMessage('');
        setIsActive(true);
        setEditingId(null);
        fetchAnnouncements();
      } else {
        alert(res.data.message);
      }
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Error saving announcement');
    }
  };

  const handleEdit = (ann) => {
    setEditingId(ann.id);
    setMessage(ann.message);
    setIsActive(ann.is_active);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this announcement?')) return;
    try {
      const res = await axios.delete(`/admin/announcements/${id}`);
      if (res.data.success) fetchAnnouncements();
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Error deleting announcement');
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm('Are you sure you want to clear all announcements? This cannot be undone.')) return;
    try {
      const res = await axios.delete('/admin/announcements');
      if (res.data.success) fetchAnnouncements();
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Error clearing announcements');
    }
  };

  return (
    <div className="admin-page">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title"><Megaphone style={{ marginRight: '0.5rem', display: 'inline' }} /> Manage Announcements</h1>
          <p className="page-subtitle">Add and update customer announcements</p>
        </div>
        {announcements.length > 0 && (
          <button onClick={handleClearAll} className="btn" style={{ backgroundColor: 'var(--danger)', color: 'white' }}>
            <Trash2 size={16} style={{ marginRight: '0.5rem' }} /> Clear All
          </button>
        )}
      </div>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <h3>{editingId ? 'Edit Announcement' : 'New Announcement'}</h3>
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap', marginTop: '1rem' }}>
          <input
            type="text"
            className="form-input"
            placeholder="e.g. Night Orders Will be available soon"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            style={{ flex: 1, minWidth: '250px' }}
            required
          />
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
            />
            Active
          </label>
          <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {editingId ? <Edit2 size={16} /> : <Plus size={16} />}
            {editingId ? 'Update' : 'Add'}
          </button>
          {editingId && (
             <button type="button" className="btn btn-secondary" onClick={() => { setEditingId(null); setMessage(''); setIsActive(true); }}>
               Cancel
             </button>
          )}
        </form>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem' }}>Loading...</div>
      ) : error ? (
        <div style={{ color: 'var(--danger)', padding: '1rem', background: '#ffebee', borderRadius: '4px' }}>
          <AlertCircle style={{ display: 'inline', marginRight: '0.5rem' }} /> {error}
        </div>
      ) : announcements.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', background: 'var(--bg-secondary)', borderRadius: '8px', color: 'var(--text-secondary)' }}>
          <Megaphone size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
          <p>No announcements found.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {announcements.map((ann) => (
            <div key={ann.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.5rem' }}>
              <div>
                <p style={{ margin: 0, fontWeight: '500', fontSize: '1.1rem' }}>{ann.message}</p>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                  <span style={{ 
                    display: 'inline-block', 
                    padding: '0.1rem 0.5rem', 
                    borderRadius: '1rem', 
                    backgroundColor: ann.is_active ? '#e8f5e9' : '#ffebee',
                    color: ann.is_active ? '#2e7d32' : '#c62828',
                    marginRight: '0.5rem'
                  }}>
                    {ann.is_active ? 'Active' : 'Inactive'}
                  </span>
                  Added: {new Date(ann.created_at).toLocaleDateString()}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={() => handleEdit(ann)} className="btn btn-secondary" style={{ padding: '0.5rem' }} title="Edit">
                  <Edit2 size={16} />
                </button>
                <button onClick={() => handleDelete(ann.id)} className="btn btn-secondary" style={{ padding: '0.5rem', color: 'var(--danger)' }} title="Delete">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminAnnouncements;
