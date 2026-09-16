import { useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { Lock, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import AlertBanner from '../components/ui/AlertBanner';
import MotionButton from '../components/ui/MotionButton';
import { useMotionSafe } from '../lib/motion';
import MagicRings from '../components/MagicRings';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { resetPassword } = useAuth();
  const { transition } = useMotionSafe();
  const cardRef = useRef(null);
  
  const [formData, setFormData] = useState({ newPassword: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (formData.newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const res = await resetPassword(token, formData.newPassword, formData.confirmPassword);
      setSuccess(res.message || 'Password reset successfully!');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password. The link may be invalid or expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page" style={{ background: 'transparent' }}>
      {/* Static Themed MagicRings Background */}
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
      </div>

      <motion.div
        className="auth-container"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={transition}
      >
        <div className="auth-card" ref={cardRef} style={{ maxWidth: '450px' }}>
          <div className="auth-header">
            <motion.div
              className="auth-logo"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ ...transition, delay: 0.1 }}
            >
              <img src="/canteen-logo.png" alt="AparnaDevi Logo" className="auth-logo-img" />
            </motion.div>
            <h1 className="auth-title">Create New Password</h1>
            <p className="auth-subtitle">Please enter your new password below.</p>
          </div>

          <AlertBanner type="error" show={!!error}>
            <AlertCircle size={18} style={{ marginRight: '0.5rem' }} />
            {error}
          </AlertBanner>

          {success ? (
            <div style={{ textAlign: 'center', padding: '1rem', background: 'rgba(20, 255, 100, 0.1)', color: '#14FF64', borderRadius: '8px', marginBottom: '1.5rem' }}>
              <CheckCircle size={32} style={{ margin: '0 auto 10px', display: 'block' }} />
              {success}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label className="form-label" htmlFor="newPassword">New Password</label>
                <div className="auth-input-wrapper">
                  <Lock size={18} className="auth-input-icon" />
                  <input
                    type={showPassword ? "text" : "password"}
                    id="newPassword"
                    name="newPassword"
                    className="form-input"
                    placeholder="Enter new password"
                    value={formData.newPassword}
                    onChange={handleChange}
                    required
                  />
                  <button 
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="confirmPassword">Confirm Password</label>
                <div className="auth-input-wrapper">
                  <Lock size={18} className="auth-input-icon" />
                  <input
                    type={showPassword ? "text" : "password"}
                    id="confirmPassword"
                    name="confirmPassword"
                    className="form-input"
                    placeholder="Confirm new password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <MotionButton
                type="submit"
                className="btn btn-primary btn-lg auth-submit-btn"
                disabled={loading}
                style={{ width: '100%' }}
                id="reset-password-submit"
              >
                {loading ? <span className="btn-spinner" aria-hidden="true" /> : 'Reset Password'}
              </MotionButton>
            </form>
          )}

          <div className="auth-footer" style={{ marginTop: '0.85rem', justifyContent: 'center' }}>
            <Link to="/login" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', textDecoration: 'none' }}>
              Return to Login
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ResetPassword;
