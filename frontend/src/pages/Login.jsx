import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { LogIn, Phone, Mail, Lock, AlertCircle, Eye, EyeOff, MessageCircle } from 'lucide-react';
import AnimatedTabs from '../components/ui/AnimatedTabs';
import MotionButton from '../components/ui/MotionButton';
import AlertBanner from '../components/ui/AlertBanner';
import Lazy3D from '../components/3d/Lazy3D';
import { useMotionSafe } from '../lib/motion';
import heroImg from '../assets/hero.png';

const Login = () => {
  const [activeTab, setActiveTab] = useState('customer');
  const [formData, setFormData] = useState({ phone: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { transition } = useMotionSafe();

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
    <div className="auth-page auth-split">
      <div className="auth-visual" aria-hidden="true">
        <div className="auth-visual-inner">
          <Lazy3D
            load={() => import('../components/3d/FoodTray3D')}
            className="auth-visual-canvas"
            fallback={<img src={heroImg} alt="" className="auth-visual-img" />}
          />
          <div className="auth-visual-copy">
            <h2>Skip the queue</h2>
            <p>Order your favourite meals from AparnaCanteen and pick them up hot — straight from the counter.</p>
          </div>
        </div>
      </div>
      <motion.div
        className="auth-container"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={transition}
      >
        <div className="auth-card">
          <div className="auth-header">
            <motion.div
              className="auth-logo"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ ...transition, delay: 0.1 }}
            >
              <img src="/favicon.jpg" alt="Logo" className="sidebar-logo-img" />
            </motion.div>
            <h1 className="auth-title">AparnaCanteen</h1>
            <p className="auth-subtitle">Welcome back</p>
          </div>

          <AnimatedTabs
            tabs={[
              { id: 'customer', label: 'Customer' },
              { id: 'admin', label: 'Admin' },
            ]}
            activeTab={activeTab}
            onChange={(id) => { setActiveTab(id); setError(''); }}
          />

          <AlertBanner type="error" show={!!error}>
            <AlertCircle size={16} style={{ marginRight: '0.5rem', display: 'inline' }} />
            {error}
          </AlertBanner>

          <form onSubmit={handleSubmit}>
            {activeTab === 'customer' ? (
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <div className="auth-input-wrapper">
                  <Phone size={18} className="auth-input-icon" />
                  <input
                    type="tel"
                    name="phone"
                    className="form-input"
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
                <div className="auth-input-wrapper">
                  <Mail size={18} className="auth-input-icon" />
                  <input
                    type="email"
                    name="email"
                    className="form-input"
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
              <div className="auth-input-wrapper">
                <Lock size={18} className="auth-input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  className="form-input has-toggle"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  id="login-password"
                />
                <button
                  type="button"
                  className="auth-toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <MotionButton type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading} id="login-submit">
              {loading ? <div className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} /> : <><LogIn size={18} /> Sign In</>}
            </MotionButton>
          </form>

          <div className="auth-footer">
            <div>
              Don't have an account? <Link to="/register">Sign Up</Link>
            </div>
            <div className="auth-contact-section">
              <p style={{ color: 'var(--text-secondary)', marginBottom: '0.75rem', fontSize: '0.85rem' }}>
                If any Password related queries contact to this number
              </p>
              <div className="auth-contact-actions">
                <span style={{ fontWeight: '700', color: 'var(--text-primary)', fontSize: '1rem' }}>9989092333</span>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <a href="tel:9989092333" className="btn btn-secondary btn-sm">
                    <Phone size={14} /> Call
                  </a>
                  <a
                    href="https://wa.me/919989092333"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary btn-sm btn-whatsapp"
                  >
                    <MessageCircle size={14} /> WhatsApp
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
