import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, AlertCircle, CheckCircle } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    hostelBlock: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
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
              <label className="form-label">Hostel Block</label>
              <input
                type="text"
                name="hostelBlock"
                className="form-input"
                placeholder="e.g., Block A, Block B"
                value={formData.hostelBlock}
                onChange={handleChange}
                id="register-block"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email (Optional)</label>
              <input
                type="email"
                name="email"
                className="form-input"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                id="register-email"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password *</label>
              <input
                type="password"
                name="password"
                className="form-input"
                placeholder="Min. 6 characters"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
                id="register-password"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Confirm Password *</label>
              <input
                type="password"
                name="confirmPassword"
                className="form-input"
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
