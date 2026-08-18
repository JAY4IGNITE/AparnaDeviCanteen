import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { User, Phone, Mail, Building, CheckCircle, AlertCircle, Lock, Eye, EyeOff, Save } from 'lucide-react';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('view'); // 'view', 'edit', 'password'
  
  // Profile Form State
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    hostelBlock: user?.hostelBlock || ''
  });

  // Password Form State
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // UI State
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState({ current: false, new: false, confirm: false });

  const handleProfileChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
    setError('');
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    setError('');
  };

  const togglePasswordVisibility = (field) => {
    setShowPassword({ ...showPassword, [field]: !showPassword[field] });
  };

  // Submit Profile Changes
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    // Validate phone number format (exactly 10 digits, optionally starting with country code/spaces)
    const cleanPhone = profileData.phone.replace(/\D/g, '');
    let finalPhone = cleanPhone;
    if (cleanPhone.length === 12 && cleanPhone.startsWith('91')) {
      finalPhone = cleanPhone.slice(2);
    }
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(finalPhone)) {
      setError('Please enter a valid 10-digit phone number');
      setLoading(false);
      return;
    }

    try {
      const res = await axios.put('/auth/profile', { ...profileData, phone: finalPhone });
      if (res.data.success) {
        updateUser(res.data.user);
        setSuccess('Profile details updated successfully!');
        setActiveTab('view');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Submit Password Change
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError('New password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    try {
      const res = await axios.put('/auth/password', passwordData);
      if (res.data.success) {
        setSuccess('Password changed successfully!');
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setActiveTab('view');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>My Profile</h1>
        <p>Manage your account settings and details</p>
      </div>

      <div className="auth-tabs" style={{ maxWidth: '600px', margin: '0 auto 1.5rem' }}>
        <button
          className={`auth-tab ${activeTab === 'view' ? 'active' : ''}`}
          onClick={() => { setActiveTab('view'); setError(''); setSuccess(''); }}
        >
          View Details
        </button>
        <button
          className={`auth-tab ${activeTab === 'edit' ? 'active' : ''}`}
          onClick={() => { setActiveTab('edit'); setError(''); setSuccess(''); }}
        >
          Edit Details
        </button>
        <button
          className={`auth-tab ${activeTab === 'password' ? 'active' : ''}`}
          onClick={() => { setActiveTab('password'); setError(''); setSuccess(''); }}
        >
          Change Password
        </button>
      </div>

      {success && (
        <div className="alert alert-success" style={{ maxWidth: '600px', margin: '0 auto 1.5rem' }}>
          <CheckCircle size={16} style={{ marginRight: '0.5rem', display: 'inline' }} />
          {success}
        </div>
      )}

      {error && (
        <div className="alert alert-error" style={{ maxWidth: '600px', margin: '0 auto 1.5rem' }}>
          <AlertCircle size={16} style={{ marginRight: '0.5rem', display: 'inline' }} />
          {error}
        </div>
      )}

      <div className="card-static" style={{ maxWidth: '600px', margin: '0 auto' }}>
        
        {/* VIEW DETAILS TAB */}
        {activeTab === 'view' && (
          <div>
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
        )}

        {/* EDIT DETAILS TAB */}
        {activeTab === 'edit' && (
          <form onSubmit={handleProfileSubmit}>
            <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
              Update Profile Details
            </h3>

            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div style={{ position: 'relative' }}>
                <User size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  name="name"
                  className="form-input"
                  style={{ paddingLeft: '2.5rem' }}
                  value={profileData.name}
                  onChange={handleProfileChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <div style={{ position: 'relative' }}>
                <Phone size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="tel"
                  name="phone"
                  className="form-input"
                  style={{ paddingLeft: '2.5rem' }}
                  value={profileData.phone}
                  onChange={handleProfileChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Hostel Block</label>
              <div style={{ position: 'relative' }}>
                <Building size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <select
                  name="hostelBlock"
                  className="form-input"
                  style={{ paddingLeft: '2.5rem' }}
                  value={profileData.hostelBlock}
                  onChange={handleProfileChange}
                  required
                >
                  <option value="F Block">F Block</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={loading}>
              {loading ? (
                <div className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }}></div>
              ) : (
                <>
                  <Save size={18} style={{ marginRight: '0.5rem' }} /> Save Changes
                </>
              )}
            </button>
          </form>
        )}

        {/* CHANGE PASSWORD TAB */}
        {activeTab === 'password' && (
          <form onSubmit={handlePasswordSubmit}>
            <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
              Change Account Password
            </h3>

            <div className="form-group">
              <label className="form-label">Current Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type={showPassword.current ? "text" : "password"}
                  name="currentPassword"
                  className="form-input"
                  style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                  placeholder="Enter current password"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  required
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('current')}
                  style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                >
                  {showPassword.current ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">New Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type={showPassword.new ? "text" : "password"}
                  name="newPassword"
                  className="form-input"
                  style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                  placeholder="Min. 6 characters"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  required
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('new')}
                  style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                >
                  {showPassword.new ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type={showPassword.confirm ? "text" : "password"}
                  name="confirmPassword"
                  className="form-input"
                  style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                  placeholder="Re-enter new password"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  required
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('confirm')}
                  style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                >
                  {showPassword.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={loading}>
              {loading ? (
                <div className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }}></div>
              ) : (
                <>
                  <Lock size={18} style={{ marginRight: '0.5rem' }} /> Update Password
                </>
              )}
            </button>
          </form>
        )}

      </div>
    </div>
  );
};

export default Profile;
