import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CheckCircle, XCircle, Loader } from 'lucide-react';

const VerifyEmail = () => {
  const { token } = useParams();
  const { verifyEmail } = useAuth();
  const [status, setStatus] = useState('loading'); // loading, success, error
  const [message, setMessage] = useState('');

  useEffect(() => {
    const performVerification = async () => {
      try {
        const res = await verifyEmail(token);
        setStatus('success');
        setMessage(res.message || 'Email verified successfully!');
      } catch (err) {
        setStatus('error');
        setMessage(err.response?.data?.message || 'Verification failed. The link may be invalid or expired.');
      }
    };
    if (token) {
      performVerification();
    }
  }, [token, verifyEmail]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-color)' }}>
      <div style={{ background: 'var(--card-bg)', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', maxWidth: '400px', width: '90%', textAlign: 'center' }}>
        {status === 'loading' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            <Loader size={48} className="spinner" style={{ color: 'var(--primary)' }} />
            <h2 style={{ color: 'var(--text-primary)' }}>Verifying your email...</h2>
          </div>
        )}

        {status === 'success' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            <CheckCircle size={48} color="#14FF64" />
            <h2 style={{ color: 'var(--text-primary)' }}>Verification Successful!</h2>
            <p style={{ color: 'var(--text-secondary)' }}>{message}</p>
            <Link to="/login" className="btn btn-primary" style={{ marginTop: '1rem', display: 'inline-block', textDecoration: 'none' }}>
              Proceed to Login
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            <XCircle size={48} color="#FF4444" />
            <h2 style={{ color: 'var(--text-primary)' }}>Verification Failed</h2>
            <p style={{ color: 'var(--text-secondary)' }}>{message}</p>
            <Link to="/login" className="btn btn-secondary" style={{ marginTop: '1rem', display: 'inline-block', textDecoration: 'none' }}>
              Back to Login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
