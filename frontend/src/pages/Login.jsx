import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, Phone, Mail, Lock, AlertCircle, Eye, EyeOff, MessageCircle } from 'lucide-react';

const Login = () => {
  const [activeTab, setActiveTab] = useState('customer');
  const [formData, setFormData] = useState({ phone: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const credentials = {
        password: formData.password,
        role: activeTab
      };

      if (activeTab === 'admin') {
        credentials.email = formData.email;
      } else {
        credentials.phone = formData.phone;
      }

      const user = await login(credentials);

      if (user.role === 'admin') {
        navigate('/admin/home');
      } else {
        navigate('/customer/home');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-logo">
              <img src="/favicon.jpg" alt="Logo" style={{ width: '100%', height: '100%', borderRadius: 'inherit', objectFit: 'cover' }} />
            </div>
            <h1 className="auth-title">AparnaCanteen</h1>
            <p className="auth-subtitle">Welcome back</p>
          </div>

          <div className="auth-tabs">
            <button
              className={`auth-tab ${activeTab === 'customer' ? 'active' : ''}`}
              onClick={() => { setActiveTab('customer'); setError(''); }}
            >
              Customer
            </button>
            <button
              className={`auth-tab ${activeTab === 'admin' ? 'active' : ''}`}
              onClick={() => { setActiveTab('admin'); setError(''); }}
            >
              Admin
            </button>
          </div>

          {error && (
            <div className="alert alert-error">
              <AlertCircle size={16} style={{ marginRight: '0.5rem', display: 'inline' }} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {activeTab === 'customer' ? (
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <div style={{ position: 'relative' }}>
                  <Phone size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="tel"
                    name="phone"
                    className="form-input"
                    style={{ paddingLeft: '2.5rem' }}
                    placeholder="Enter your phone number"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    id="login-phone"
                  />
                </div>
              </div>
            ) : (
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="email"
                    name="email"
                    className="form-input"
                    style={{ paddingLeft: '2.5rem' }}
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    id="login-email"
                  />
                </div>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  className="form-input"
                  style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  id="login-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading} id="login-submit">
              {loading ? <div className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }}></div> : <><LogIn size={18} /> Sign In</>}
            </button>
          </form>

          <div className="auth-footer">
            <div>
              Don't have an account? <Link to="/register">Sign Up</Link>
            </div>
            <div style={{ marginTop: '1.25rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '0.75rem', fontSize: '0.85rem' }}>
                If any Password related queries contact to this number
              </p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                <span style={{ fontWeight: '700', color: 'var(--text-primary)', fontSize: '1rem' }}>9989092333</span>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <a
                    href="tel:9989092333"
                    className="btn btn-secondary"
                    style={{
                      padding: '0.4rem 0.8rem',
                      fontSize: '0.8rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      height: 'auto',
                      borderRadius: 'var(--radius-md)',
                      borderColor: 'var(--border-color)'
                    }}
                  >
                    <Phone size={14} style={{ width: '14px', height: '14px' }} /> Call
                  </a>
                  <a
                    href="https://wa.me/919989092333"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary"
                    style={{
                      padding: '0.4rem 0.8rem',
                      fontSize: '0.8rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      height: 'auto',
                      borderColor: '#25D366',
                      color: '#25D366',
                      borderRadius: 'var(--radius-md)'
                    }}
                  >
                    <MessageCircle size={14} style={{ width: '14px', height: '14px' }} /> WhatsApp
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
