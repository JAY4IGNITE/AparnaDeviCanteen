import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { UserPlus, AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';
import MotionButton from '../components/ui/MotionButton';
import AlertBanner from '../components/ui/AlertBanner';
import Lazy3D from '../components/3d/Lazy3D';
import { useMotionSafe } from '../lib/motion';
import heroImg from '../assets/hero.png';

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
  const { transition } = useMotionSafe();

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
    <div className="auth-page auth-split">
      <div className="auth-visual" aria-hidden="true">
        <div className="auth-visual-inner">
          <Lazy3D
            load={() => import('../components/3d/FoodTray3D')}
            className="auth-visual-canvas"
            fallback={<img src={heroImg} alt="" className="auth-visual-img" />}
          />
          <div className="auth-visual-copy">
            <h2>Join the canteen</h2>
            <p>Create your account to order ahead, track every meal, and skip the line at AparnaCanteen.</p>
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
            <h1 className="auth-title">Create Account</h1>
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

            <div className="form-group">
              <label className="form-label">Password *</label>
              <div className="auth-input-wrapper">
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
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Confirm Password *</label>
              <input
                type={showPassword ? 'text' : 'password'}
                name="confirmPassword"
                className="form-input"
                placeholder="Re-enter password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                id="register-confirm-password"
              />
            </div>

            <MotionButton type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading} id="register-submit">
              {loading ? <div className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} /> : <><UserPlus size={18} /> Create Account</>}
            </MotionButton>
          </form>

          <div className="auth-footer">
            Already have an account? <Link to="/login">Sign In</Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
