import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    hostelBlock: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      await register(formData);
      setSuccess('Registration successful! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-logo">FN</div>
            <h1 className="auth-title">Create Account</h1>
            <p className="auth-subtitle">Join FoodNest today</p>
          </div>

          {error && (
            <div className="alert alert-error">
              <AlertCircle size={16} style={{ marginRight: '0.5rem', display: 'inline' }} />
              {error}
            </div>
          )}

          {success && (
            <div className="alert alert-success">
              <CheckCircle size={16} style={{ marginRight: '0.5rem', display: 'inline' }} />
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input
                type="text"
                name="name"
                className="form-input"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
                required
                id="register-name"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number *</label>
              <input
                type="tel"
                name="phone"
                className="form-input"
                placeholder="Enter your phone number"
                value={formData.phone}
                onChange={handleChange}
                required
                id="register-phone"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Hostel Block *</label>
              <select
                name="hostelBlock"
                className="form-input"
                value={formData.hostelBlock}
                onChange={handleChange}
                required
                id="register-block"
              >
                <option value="">Select Block</option>
                <option value="F Block">F Block</option>
                <option value="Other">Other</option>
              </select>
            </div>



            <div className="form-group" style={{ position: 'relative' }}>
              <label className="form-label">Password *</label>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                className="form-input"
                style={{ paddingRight: '2.5rem' }}
                placeholder="Min. 6 characters"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
                id="register-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '0.75rem', bottom: '0.5rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <div className="form-group" style={{ position: 'relative' }}>
              <label className="form-label">Confirm Password *</label>
              <input
                type={showPassword ? "text" : "password"}
                name="confirmPassword"
                className="form-input"
                style={{ paddingRight: '2.5rem' }}
                placeholder="Re-enter password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                id="register-confirm-password"
              />
            </div>

            <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading} id="register-submit">
              {loading ? <div className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }}></div> : <><UserPlus size={18} /> Create Account</>}
            </button>
          </form>

          <div className="auth-footer">
            Already have an account? <Link to="/login">Sign In</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
