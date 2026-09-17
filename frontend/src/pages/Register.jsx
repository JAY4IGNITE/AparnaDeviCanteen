import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { AlertCircle, CheckCircle, Eye, EyeOff, Lock } from 'lucide-react';
import MotionButton from '../components/ui/MotionButton';
import AlertBanner from '../components/ui/AlertBanner';
import { useMotionSafe } from '../lib/motion';
import MagicRings from '../components/MagicRings';
import ThemeToggleDock from '../components/ThemeToggleDock';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    hostelBlock: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { user, register } = useAuth();
  const navigate = useNavigate();
  const { transition } = useMotionSafe();
  const cardRef = useRef(null);

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        navigate('/admin/home', { replace: true });
      } else {
        navigate('/customer/home', { replace: true });
      }
    }
  }, [user, navigate]);





  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const phoneRegex = /^(?:\+91|91)?\d{10}$/;
    if (!phoneRegex.test(formData.phone.trim())) {
      setError('Please enter a valid phone number (10 digits, or 12/13 digits starting with 91 or +91).');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setLoading(true);

    try {
      await register({ ...formData, confirmPassword: formData.password });
      setSuccess('Registration successful! Please check your email to verify your account. Redirecting to login...');
      setTimeout(() => navigate('/login'), 5000);
    } catch (err) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.message?.includes('Network Error') || err.code === 'ERR_NETWORK') {
        setError('Unable to connect to the server. Please check your connection or try again shortly.');
      } else {
        setError(err.message || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page" style={{ background: 'transparent' }}>
      {/* Theme Toggle Dock — fixed top right */}
      <ThemeToggleDock />

      {/* Simplified, Lightweight Themed MagicRings Background - Full Page Coverage */}
      <div
        className="auth-magic-rings"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          pointerEvents: 'none',
          zIndex: 0,
          overflow: 'hidden',
        }}
      >
        {!isMobile && (
          <MagicRings
            color="#ff4500"
            colorTwo="#f97316"
            colorThree="#ffb703"
            ringCount={4}
            speed={0.6}
            attenuation={8}
            lineThickness={1.5}
            baseRadius={0.36}
            radiusStep={0.16}
            scaleRate={0.1}
            opacity={0.68}
            blur={0}
            noiseAmount={0.02}
            rotation={0}
            ringGap={1.35}
            fadeIn={0.7}
            fadeOut={0.5}
            followMouse={false}
            mouseInfluence={0}
            hoverScale={1.0}
            parallax={0}
            clickBurst={false}
          />
        )}
      </div>

      <motion.div
        className="auth-container auth-container-wide"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={transition}
      >
        <div className="auth-card" ref={cardRef}>
          <div className="auth-header">
            <Link to="/" className="auth-header-brand" title="Back to Home" style={{ textDecoration: 'none', color: 'inherit', display: 'inline-flex', flexDirection: 'column', alignItems: 'center' }}>
              <motion.div
                className="auth-logo"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ ...transition, delay: 0.1 }}
              >
                <img src="/canteen-logo.png" alt="AparnaDevi Logo" className="auth-logo-img" />
              </motion.div>
              <h1 className="auth-title">Create Account</h1>
            </Link>
            <p className="auth-subtitle">Join AparnaCanteen today</p>
          </div>

          <AlertBanner type="error" show={!!error}>
            <AlertCircle size={16} style={{ marginRight: '0.5rem', display: 'inline' }} />
            {error}
          </AlertBanner>

          <AlertBanner type="success" show={!!success}>
            <CheckCircle size={16} style={{ marginRight: '0.5rem', display: 'inline' }} />
            {success}
          </AlertBanner>

          <form onSubmit={handleSubmit}>
            <div className="auth-row-2col">
              <div className="form-group">
                <label className="form-label" htmlFor="register-name">Full Name *</label>
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
                <label className="form-label" htmlFor="register-phone">Phone Number *</label>
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
            </div>

            <div className="auth-row-2col">
              <div className="form-group">
                <label className="form-label" htmlFor="register-email">Email Address *</label>
                <input
                  type="email"
                  name="email"
                  className="form-input"
                  placeholder="Enter your email address"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  id="register-email"
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="register-block">Hostel Block *</label>
                <select
                  name="hostelBlock"
                  className="form-input"
                  value={formData.hostelBlock}
                  onChange={handleChange}
                  required
                  id="register-block"
                >
                  <option value="">Select Block</option>
                  <option value="F Block (Old)">F Block (Old)</option>
                  <option value="Others(A, B, C, D, F)">Others(A, B, C, D, F)</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="register-password">Password *</label>
              <div className="auth-input-wrapper">
                <Lock size={18} className="auth-input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  className="form-input has-toggle"
                  placeholder="Min. 6 characters"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                  id="register-password"
                />
                <button
                  type="button"
                  className="auth-toggle-password"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  aria-pressed={showPassword}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <MotionButton
              type="submit"
              className="btn btn-primary btn-lg auth-submit-btn"
              style={{ width: '100%' }}
              disabled={loading}
              id="register-submit"
            >
              {loading ? <span className="btn-spinner" aria-hidden="true" /> : 'Create Account'}
            </MotionButton>
          </form>

          <div className="auth-footer">
            Already have an account? <Link to="/login" replace>Sign In</Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
