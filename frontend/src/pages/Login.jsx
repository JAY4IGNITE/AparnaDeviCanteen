import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { Phone, Mail, Lock, AlertCircle, Eye, EyeOff, LogOut } from 'lucide-react';
import MotionButton from '../components/ui/MotionButton';
import AlertBanner from '../components/ui/AlertBanner';
import AnimatedModal from '../components/ui/AnimatedModal';
import { useMotionSafe } from '../lib/motion';
import useNeonBorder from '../hooks/useNeonBorder';
import MagicRings from '../components/MagicRings';
import ThemeToggleDock from '../components/ThemeToggleDock';

const Login = () => {
  const [formData, setFormData] = useState({ identifier: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showUnverifiedModal, setShowUnverifiedModal] = useState(false);
  const [emailSentSuccess, setEmailSentSuccess] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const { user, login, updateEmail, resendVerification, logout } = useAuth();
  const navigate = useNavigate();
  const { transition } = useMotionSafe();
  const cardRef = useRef(null);
  useNeonBorder(cardRef, { color: '#f97316', thickness: 3, borderSize: 50, glow: 80, speed: 14 });

  // If already authenticated, redirect to the dashboard without adding extra history entries
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
    setLoading(true);

    try {
      const credentials = {
        identifier: formData.identifier,
        password: formData.password
      };

      const user = await login(credentials);

      if (user.role === 'admin') {
        proceedToApp(user);
      } else if (!user.email) {
        setEmailInput('');
        setShowEmailModal(true);
      } else if (!user.email_verified) {
        setEmailInput(user.email || '');
        setShowUnverifiedModal(true);
      } else {
        proceedToApp(user);
      }
    } catch (err) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.message?.includes('Network Error') || err.code === 'ERR_NETWORK') {
        setError('Unable to connect to the server. Please check your connection or try again shortly.');
      } else {
        setError(err.message || 'Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const proceedToApp = (userObj) => {
    if (userObj.role === 'admin') {
      navigate('/admin/home', { replace: true });
    } else {
      navigate('/customer/home', { replace: true });
    }
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setEmailError('');
    setEmailLoading(true);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailInput.trim())) {
      setEmailError('Please enter a valid email address.');
      setEmailLoading(false);
      return;
    }

    try {
      await updateEmail(emailInput.trim());
      setEmailSentSuccess(`Verification email sent to ${emailInput.trim()}. Please check your inbox and verify your email.`);
    } catch (err) {
      setEmailError(err.response?.data?.message || 'Failed to update email. Please try again.');
    } finally {
      setEmailLoading(false);
    }
  };

  const handleResendVerification = async (e) => {
    if (e) e.preventDefault();
    setEmailError('');
    setEmailSentSuccess('');
    setEmailLoading(true);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailInput.trim())) {
      setEmailError('Please enter a valid email address.');
      setEmailLoading(false);
      return;
    }

    try {
      const res = await resendVerification(emailInput.trim());
      setEmailSentSuccess(res.message || `Verification email sent to ${emailInput.trim()}! Please check your inbox.`);
    } catch (err) {
      setEmailError(err.response?.data?.message || 'Failed to resend email.');
    } finally {
      setEmailLoading(false);
    }
  };

  const handleCancelEmail = () => {
    logout();
    setShowEmailModal(false);
    setEmailInput('');
    setError('Login cancelled. Email is required to continue.');
  };

  return (
    <div className="auth-page" style={{ background: 'transparent' }}>
      {/* Theme Toggle Dock — fixed top right */}
      <ThemeToggleDock />

      {/* Simplified, Lightweight Themed MagicRings Background */}
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
              <h1 className="auth-title">Aparna Devi Canteen</h1>
            </Link>
            <p className="auth-subtitle">Welcome back</p>
          </div>

          <AlertBanner type="error" show={!!error}>
            <AlertCircle size={16} style={{ marginRight: '0.5rem', display: 'inline' }} />
            {error}
          </AlertBanner>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="login-identifier">Email or Phone Number</label>
              <div className="auth-input-wrapper">
                {formData.identifier.includes('@') ? (
                  <Mail size={18} className="auth-input-icon" />
                ) : (
                  <Phone size={18} className="auth-input-icon" />
                )}
                <input
                  type="text"
                  name="identifier"
                  className="form-input"
                  placeholder="Enter your email or phone number"
                  value={formData.identifier}
                  onChange={handleChange}
                  required
                  id="login-identifier"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="login-password">Password</label>
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
              id="login-submit"
            >
              {loading ? <span className="btn-spinner" aria-hidden="true" /> : 'Sign In'}
            </MotionButton>
          </form>

          <div className="auth-footer">
            <div style={{ marginBottom: '0.45rem' }}>
              <Link to="/forgot-password" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: '500' }}>Forgot Password?</Link>
            </div>
            <div>
              Don't have an account? <Link to="/register" replace>Sign Up</Link>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Mandatory Email Collection Modal */}
      <AnimatedModal 
        open={showEmailModal} 
        onClose={() => {}} 
        title="Email Required"
      >
        <div className="modal-header" style={{ justifyContent: 'center', borderBottom: 'none', paddingBottom: 0 }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, textAlign: 'center', margin: 0, color: 'var(--primary)' }}>
            ACTION REQUIRED
          </h2>
        </div>
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1.5rem 2rem 2rem 2rem' }}>
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
            To improve account security and communication, we now require an email address for all accounts. Please provide your email to continue.
          </p>

          <AlertBanner type="error" show={!!emailError}>
            <AlertCircle size={16} style={{ marginRight: '0.5rem', display: 'inline' }} />
            {emailError}
          </AlertBanner>

          {emailSentSuccess ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
              <div style={{ padding: '1rem', background: 'rgba(20, 255, 100, 0.1)', color: '#14FF64', borderRadius: '8px', textAlign: 'center' }}>
                {emailSentSuccess}
              </div>
              <button className="btn btn-secondary" onClick={handleCancelEmail}>Back to Login</button>
            </div>
          ) : (
            <form onSubmit={handleEmailSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="required-email">Email Address</label>
                <div className="auth-input-wrapper">
                  <Mail size={18} className="auth-input-icon" />
                  <input
                    type="email"
                    name="requiredEmail"
                    className="form-input"
                    placeholder="Enter your email"
                    value={emailInput}
                    onChange={(e) => {
                      setEmailInput(e.target.value);
                      setEmailError('');
                    }}
                    required
                    id="required-email"
                  />
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleCancelEmail}
                  disabled={emailLoading}
                  style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
                >
                  <LogOut size={18} /> Cancel
                </button>
                <MotionButton 
                  type="submit" 
                  className="btn btn-primary" 
                  disabled={emailLoading}
                  style={{ flex: 2, minHeight: '40px' }}
                >
                  {emailLoading ? <span className="btn-spinner" aria-hidden="true" /> : 'Save & Continue'}
                </MotionButton>
              </div>
            </form>
          )}
        </div>
      </AnimatedModal>

      {/* Unverified Email Modal */}
      <AnimatedModal 
        open={showUnverifiedModal} 
        onClose={() => {}} 
        title="Email Verification Required"
      >
        <div className="modal-header" style={{ justifyContent: 'center', borderBottom: 'none', paddingBottom: 0 }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, textAlign: 'center', margin: 0, color: 'var(--primary)' }}>
            VERIFY EMAIL
          </h2>
        </div>
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '1.5rem 2rem 2rem 2rem' }}>
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
            Your email address has not been verified yet. Check your inbox or enter/update your email address below to receive a verification link.
          </p>

          <AlertBanner type="error" show={!!emailError}>
            <AlertCircle size={16} style={{ marginRight: '0.5rem', display: 'inline' }} />
            {emailError}
          </AlertBanner>

          {emailSentSuccess && (
            <div style={{ padding: '1rem', background: 'rgba(20, 255, 100, 0.1)', color: '#14FF64', borderRadius: '8px', textAlign: 'center' }}>
              {emailSentSuccess}
            </div>
          )}
          
          <form onSubmit={handleResendVerification} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="unverified-email">Email Address to Verify</label>
              <div className="auth-input-wrapper">
                <Mail size={18} className="auth-input-icon" />
                <input
                  type="email"
                  id="unverified-email"
                  className="form-input"
                  placeholder="Enter your email"
                  value={emailInput}
                  onChange={(e) => {
                    setEmailInput(e.target.value);
                    setEmailError('');
                    setEmailSentSuccess('');
                  }}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  logout();
                  setShowUnverifiedModal(false);
                }}
                disabled={emailLoading}
                style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
              >
                <LogOut size={18} /> Cancel
              </button>
              <MotionButton 
                type="submit" 
                className="btn btn-primary" 
                disabled={emailLoading}
                style={{ flex: 2, minHeight: '40px' }}
              >
                {emailLoading ? <span className="btn-spinner" aria-hidden="true" /> : 'Send Verification Email'}
              </MotionButton>
            </div>
          </form>
        </div>
      </AnimatedModal>
    </div>
  );
};

export default Login;
