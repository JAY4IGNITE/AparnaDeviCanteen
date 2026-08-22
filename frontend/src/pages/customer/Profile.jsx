import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { User, Phone, Building, CheckCircle, AlertCircle, Lock, Eye, EyeOff, Save } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import AnimatedTabs from '../../components/ui/AnimatedTabs';
import AlertBanner from '../../components/ui/AlertBanner';
import MotionButton from '../../components/ui/MotionButton';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('view');

  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    hostelBlock: user?.hostelBlock || ''
  });

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
    <div>
      <PageHeader title="My Profile" subtitle="Manage your account settings and details" />

      <AnimatedTabs
        tabs={tabs}
        activeTab={activeTab}
        onChange={(id) => { setActiveTab(id); setError(''); setSuccess(''); }}
        className="profile-tabs"
      />

      <div style={{ maxWidth: '600px', margin: '0 auto 1.5rem' }}>
        <AlertBanner type="success" show={!!success}>
          <CheckCircle size={16} style={{ marginRight: '0.5rem', display: 'inline' }} />
          {success}
        </AlertBanner>
        <AlertBanner type="error" show={!!error}>
          <AlertCircle size={16} style={{ marginRight: '0.5rem', display: 'inline' }} />
          {error}
        </AlertBanner>
      </div>

      <div className="card-static" style={{ maxWidth: '600px', margin: '0 auto' }}>
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
              <div className="detail-row">
                <User size={20} className="detail-row-icon" />
                <div>
                  <div className="detail-row-label">Name</div>
                  <div className="detail-row-value">{user?.name || '—'}</div>
                </div>
              </div>
              <div className="detail-row">
                <Phone size={20} className="detail-row-icon" />
                <div>
                  <div className="detail-row-label">Phone</div>
                  <div className="detail-row-value">{user?.phone || '—'}</div>
                </div>
              </div>
              <div className="detail-row">
                <Building size={20} className="detail-row-icon" />
                <div>
                  <div className="detail-row-label">Hostel Block</div>
                  <div className="detail-row-value">{user?.hostelBlock || 'Not specified'}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'edit' && (
          <form onSubmit={handleProfileSubmit}>
            <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
              Update Profile Details
            </h3>

            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div className="auth-input-wrapper">
                <User size={18} className="auth-input-icon" />
                <input type="text" name="name" className="form-input" value={profileData.name} onChange={handleProfileChange} required />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <div className="auth-input-wrapper">
                <Phone size={18} className="auth-input-icon" />
                <input type="tel" name="phone" className="form-input" value={profileData.phone} onChange={handleProfileChange} required />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Hostel Block</label>
              <div className="auth-input-wrapper">
                <Building size={18} className="auth-input-icon" />
                <select name="hostelBlock" className="form-input" value={profileData.hostelBlock} onChange={handleProfileChange} required>
                  <option value="F Block">F Block</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <MotionButton type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={loading}>
              {loading ? <div className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} /> : <><Save size={18} /> Save Changes</>}
            </MotionButton>
          </form>
        )}

        {activeTab === 'password' && (
          <form onSubmit={handlePasswordSubmit}>
            <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
              Change Account Password
            </h3>

            {['current', 'new', 'confirm'].map((field) => (
              <div className="form-group" key={field}>
                <label className="form-label">
                  {field === 'current' ? 'Current Password' : field === 'new' ? 'New Password' : 'Confirm New Password'}
                </label>
                <div className="auth-input-wrapper">
                  <Lock size={18} className="auth-input-icon" />
                  <input
                    type={showPassword[field] ? 'text' : 'password'}
                    name={`${field}Password`}
                    className="form-input has-toggle"
                    placeholder={field === 'new' ? 'Min. 6 characters' : field === 'confirm' ? 'Re-enter new password' : 'Enter current password'}
                    value={passwordData[`${field}Password`]}
                    onChange={handlePasswordChange}
                    required
                  />
                  <button type="button" className="auth-toggle-password" onClick={() => togglePasswordVisibility(field)}>
                    {showPassword[field] ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            ))}

            <MotionButton type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={loading}>
              {loading ? <div className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} /> : <><Lock size={18} /> Update Password</>}
            </MotionButton>
          </form>
        )}
      </div>
    </div>
  );
};

export default Profile;
