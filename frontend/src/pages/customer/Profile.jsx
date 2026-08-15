import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, Phone, Mail, Building, CheckCircle } from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();
  const [message, setMessage] = useState('');

  return (
    <div>
      <div className="page-header">
        <h1>My Profile</h1>
        <p>View your account details</p>
      </div>

      {message && (
        <div className="alert alert-success">
          <CheckCircle size={16} style={{ marginRight: '0.5rem', display: 'inline' }} />
          {message}
        </div>
      )}

      <div className="card-static" style={{ maxWidth: '600px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div className="sidebar-avatar" style={{ width: '72px', height: '72px', fontSize: '1.5rem', margin: '0 auto 1rem' }}>
            {user?.name?.charAt(0)?.toUpperCase() || 'C'}
          </div>
          <h2 style={{ marginBottom: '0.25rem' }}>{user?.name}</h2>
          <span className="badge badge-active">{user?.role}</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.85rem 1rem', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)' }}>
            <User size={20} style={{ color: 'var(--text-muted)' }} />
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Name</div>
              <div style={{ fontWeight: 600 }}>{user?.name || '—'}</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.85rem 1rem', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)' }}>
            <Phone size={20} style={{ color: 'var(--text-muted)' }} />
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Phone</div>
              <div style={{ fontWeight: 600 }}>{user?.phone || '—'}</div>
            </div>
          </div>



          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.85rem 1rem', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)' }}>
            <Building size={20} style={{ color: 'var(--text-muted)' }} />
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Hostel Block</div>
              <div style={{ fontWeight: 600 }}>{user?.hostelBlock || 'Not specified'}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
