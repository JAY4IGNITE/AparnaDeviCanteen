import { useState, useEffect } from 'react';
import axios from 'axios';
import { Megaphone, Plus, Trash2, Edit2 } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import AlertBanner from '../../components/ui/AlertBanner';
import EmptyState from '../../components/ui/EmptyState';
import LoadingState from '../../components/ui/LoadingState';
import MotionButton from '../../components/ui/MotionButton';

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
      <PageHeader
        title="Manage Announcements"
        subtitle="Add and update customer announcements"
        actions={
          announcements.length > 0 ? (
            <MotionButton
              onClick={handleClearAll}
              className="btn btn-ghost"
              style={{ color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.3)' }}
            >
              <Trash2 size={16} /> Clear All
            </MotionButton>
          ) : null
        }
      />

      <div className="card" style={{ marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>{editingId ? 'Edit Announcement' : 'New Announcement'}</h3>
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
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
          <MotionButton type="submit" className="btn btn-primary">
            {editingId ? <Edit2 size={16} /> : <Plus size={16} />}
            {editingId ? 'Update' : 'Add'}
          </MotionButton>
          {editingId && (
            <MotionButton type="button" className="btn btn-secondary" onClick={() => { setEditingId(null); setMessage(''); setIsActive(true); }}>
              Cancel
            </MotionButton>
          )}
        </form>
      </div>

      {loading ? (
        <LoadingState />
      ) : error ? (
        <AlertBanner type="error" show={!!error}>{error}</AlertBanner>
      ) : announcements.length === 0 ? (
        <EmptyState icon={Megaphone} title="No announcements yet" description="Add your first announcement using the form above." />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {announcements.map((ann) => (
            <div key={ann.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', padding: '1rem 1.5rem', flexWrap: 'wrap' }}>
              <div>
                <p style={{ margin: 0, fontWeight: '500', fontSize: '1.1rem' }}>{ann.message}</p>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <span className={`badge ${ann.is_active ? 'badge-active' : 'badge-blocked'}`}>
                    {ann.is_active ? 'Active' : 'Inactive'}
                  </span>
                  <span>Added: {new Date(ann.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <MotionButton onClick={() => handleEdit(ann)} className="btn btn-secondary btn-sm" title="Edit" aria-label="Edit announcement">
                  <Edit2 size={16} />
                </MotionButton>
                <MotionButton onClick={() => handleDelete(ann.id)} className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)' }} title="Delete" aria-label="Delete announcement">
                  <Trash2 size={16} />
                </MotionButton>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminAnnouncements;
