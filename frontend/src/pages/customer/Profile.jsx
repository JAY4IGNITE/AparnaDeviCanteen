import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { User, Phone, Building, CheckCircle, AlertCircle, Lock, Eye, EyeOff, Save, Mail } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import AnimatedTabs from '../../components/ui/AnimatedTabs';
import AlertBanner from '../../components/ui/AlertBanner';
import MotionButton from '../../components/ui/MotionButton';

const normalizeBlock = (block) => {
  if (!block) return '';
  if (block === 'F Block') return 'F Block (Old)';
  if (block === 'Other' || block === 'Others') return 'Others(A, B, C, D, F)';
  return block;
};

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('view');

  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    hostelBlock: normalizeBlock(user?.hostelBlock) || 'F Block (Old)'
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        phone: user.phone || '',
        hostelBlock: normalizeBlock(user.hostelBlock) || 'F Block (Old)'
      });
    }
  }, [user]);

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

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

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const phoneRegex = /^(?:\+91|91)?\d{10}$/;
    if (!phoneRegex.test(profileData.phone.trim())) {
      setError('Please enter a valid phone number (10 digits, or 12/13 digits starting with 91 or +91).');
      return;
    }

    setLoading(true);

    try {
      const res = await axios.put('/auth/profile', profileData);
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

  const tabs = [
    { id: 'view', label: 'View Details' },
    { id: 'edit', label: 'Edit Details' },
    { id: 'password', label: 'Change Password' },
  ];

  return (
    <div className="profile-page-container">
      <PageHeader
        title="My Profile"
        subtitle="Manage your account settings and details"
        showBack={true}
        backTo="/customer/home"
      />

      <AnimatedTabs
        tabs={tabs}
        activeTab={activeTab}
        onChange={(id) => { setActiveTab(id); setError(''); setSuccess(''); }}
        className="profile-tabs"
      />

      {(success || error) && (
        <div style={{ maxWidth: '660px', margin: '0 auto 0.85rem' }}>
          <AlertBanner type="success" show={!!success}>
            <CheckCircle size={16} style={{ marginRight: '0.5rem', display: 'inline' }} />
            {success}
          </AlertBanner>
          <AlertBanner type="error" show={!!error}>
            <AlertCircle size={16} style={{ marginRight: '0.5rem', display: 'inline' }} />
            {error}
          </AlertBanner>
        </div>
      )}

      <div className="profile-card">
        {activeTab === 'view' && (
          <div>
            <div className="profile-header-group">
              <div className="profile-avatar-wrap">
                {user?.name?.charAt(0)?.toUpperCase() || 'C'}
              </div>
              <div className="profile-header-info">
                <h2 className="profile-header-name">{user?.name}</h2>
                <div>
                  <span className="badge badge-active">{user?.role}</span>
                </div>
              </div>
            </div>

            <div className="profile-details-grid">
              <div className="detail-row">
                <User size={18} className="detail-row-icon" />
                <div className="detail-row-content">
                  <div className="detail-row-label">Name</div>
                  <div className="detail-row-value">{user?.name || '—'}</div>
                </div>
              </div>

              <div className="detail-row">
                <Mail size={18} className="detail-row-icon" />
                <div className="detail-row-content">
                  <div className="detail-row-label">Email</div>
                  <div className="detail-row-value" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                    <span style={{ wordBreak: 'break-all' }}>{user?.email || '—'}</span>
                    {user?.email ? (
                      user.email_verified ? (
                        <span style={{ fontSize: '0.7rem', padding: '0.1rem 0.45rem', borderRadius: '12px', background: 'rgba(20, 255, 100, 0.15)', color: '#14FF64', fontWeight: 600 }}>
                          Verified
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.7rem', padding: '0.1rem 0.45rem', borderRadius: '12px', background: 'rgba(255, 170, 0, 0.15)', color: '#FFAA00', fontWeight: 600 }}>
                          Unverified
                        </span>
                      )
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="detail-row">
                <Phone size={18} className="detail-row-icon" />
                <div className="detail-row-content">
                  <div className="detail-row-label">Phone</div>
                  <div className="detail-row-value">{user?.phone || '—'}</div>
                </div>
              </div>

              <div className="detail-row">
                <Building size={18} className="detail-row-icon" />
                <div className="detail-row-content">
                  <div className="detail-row-label">Hostel Block</div>
                  <div className="detail-row-value">{normalizeBlock(user?.hostelBlock) || 'Not specified'}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'edit' && (
          <form onSubmit={handleProfileSubmit}>
            <h3 className="profile-form-title">Update Profile Details</h3>

            <div className="profile-form-grid">
              <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                <label className="form-label" style={{ marginBottom: '0.3rem', fontSize: '0.82rem' }}>Full Name</label>
                <div className="auth-input-wrapper">
                  <User size={16} className="auth-input-icon" />
                  <input type="text" name="name" className="form-input" value={profileData.name} onChange={handleProfileChange} required style={{ height: '38px', fontSize: '0.9rem' }} />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                <label className="form-label" style={{ marginBottom: '0.3rem', fontSize: '0.82rem' }}>Phone Number</label>
                <div className="auth-input-wrapper">
                  <Phone size={16} className="auth-input-icon" />
                  <input type="tel" name="phone" className="form-input" value={profileData.phone} onChange={handleProfileChange} required style={{ height: '38px', fontSize: '0.9rem' }} />
                </div>
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '0.95rem' }}>
              <label className="form-label" style={{ marginBottom: '0.3rem', fontSize: '0.82rem' }}>Hostel Block</label>
              <div className="auth-input-wrapper">
                <Building size={16} className="auth-input-icon" />
                <select name="hostelBlock" className="form-input" value={profileData.hostelBlock} onChange={handleProfileChange} required style={{ height: '38px', fontSize: '0.9rem' }}>
                  <option value="F Block (Old)">F Block (Old)</option>
                  <option value="Others(A, B, C, D, F)">Others(A, B, C, D, F)</option>
                </select>
              </div>
            </div>

            <MotionButton type="submit" className="btn btn-primary" style={{ width: '100%', height: '40px' }} disabled={loading}>
              {loading ? <div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> : <><Save size={16} /> Save Changes</>}
            </MotionButton>
          </form>
        )}

        {activeTab === 'password' && (
          <form onSubmit={handlePasswordSubmit}>
            <h3 className="profile-form-title">Change Account Password</h3>

            <div className="form-group" style={{ marginBottom: '0.75rem' }}>
              <label className="form-label" style={{ marginBottom: '0.3rem', fontSize: '0.82rem' }}>Current Password</label>
              <div className="auth-input-wrapper">
                <Lock size={16} className="auth-input-icon" />
                <input
                  type={showPassword.current ? 'text' : 'password'}
                  name="currentPassword"
                  className="form-input has-toggle"
                  placeholder="Enter current password"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  required
                  style={{ height: '38px', fontSize: '0.9rem' }}
                />
                <button type="button" className="auth-toggle-password" onClick={() => togglePasswordVisibility('current')}>
                  {showPassword.current ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="profile-form-grid">
              {['new', 'confirm'].map((field) => (
                <div className="form-group" key={field} style={{ marginBottom: '0.95rem' }}>
                  <label className="form-label" style={{ marginBottom: '0.3rem', fontSize: '0.82rem' }}>
                    {field === 'new' ? 'New Password' : 'Confirm Password'}
                  </label>
                  <div className="auth-input-wrapper">
                    <Lock size={16} className="auth-input-icon" />
                    <input
                      type={showPassword[field] ? 'text' : 'password'}
                      name={`${field}Password`}
                      className="form-input has-toggle"
                      placeholder={field === 'new' ? 'Min. 6 chars' : 'Re-enter'}
                      value={passwordData[`${field}Password`]}
                      onChange={handlePasswordChange}
                      required
                      style={{ height: '38px', fontSize: '0.9rem' }}
                    />
                    <button type="button" className="auth-toggle-password" onClick={() => togglePasswordVisibility(field)}>
                      {showPassword[field] ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <MotionButton type="submit" className="btn btn-primary" style={{ width: '100%', height: '40px' }} disabled={loading}>
              {loading ? <div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> : <><Lock size={16} /> Update Password</>}
            </MotionButton>
          </form>
        )}
      </div>
    </div>
  );
};

export default Profile;
