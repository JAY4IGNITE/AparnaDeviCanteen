import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import axios from 'axios';
import { Send, MessageSquare, AlertCircle, CheckCircle2, Calendar } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import AlertBanner from '../../components/ui/AlertBanner';
import { fadeUp } from '../../lib/motion';

const Feedback = () => {
  const [opinion, setOpinion] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [feedbacks, setFeedbacks] = useState([]);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    fetchFeedbackHistory();
  }, []);

  const fetchFeedbackHistory = async () => {
    try {
      setLoadingHistory(true);
      const res = await axios.get('/feedback/me');
      if (res.data.success) {
        setFeedbacks(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch feedback history:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!opinion.trim()) return;

    try {
      setSubmitting(true);
      setAlert(null);
      const res = await axios.post('/feedback', { opinion: opinion.trim() });
      
      if (res.data.success) {
        setOpinion('');
        setAlert({ type: 'success', message: 'Thank you! Your feedback has been submitted successfully.' });
        fetchFeedbackHistory(); // Refresh history list
      }
    } catch (err) {
      setAlert({
        type: 'error',
        message: err.response?.data?.message || 'Failed to submit feedback. Please try again.'
      });
    } finally {
      setSubmitting(false);
      // Auto-clear alert after 5s
      setTimeout(() => setAlert(null), 5000);
    }
  };

  return (
    <div>
      <PageHeader title="Give Feedback" subtitle="Tell us about the food quality, taste, or your dining experience" />

      <div className="feedback-grid">
        {/* Submission Form */}
        <motion.div
          className="card-static"
          initial={fadeUp.initial}
          animate={fadeUp.animate}
          transition={{ delay: 0.05 }}
        >
          <h2 className="section-title" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <MessageSquare className="text-accent-foreground" size={20} /> Share Your Opinion
          </h2>

          {alert && (
            <AlertBanner type={alert.type === 'success' ? 'success' : 'error'} show={!!alert}>
              {alert.type === 'success' ? <CheckCircle2 size={18} style={{ marginRight: '0.5rem', display: 'inline' }} /> : <AlertCircle size={18} style={{ marginRight: '0.5rem', display: 'inline' }} />}
              {alert.message}
            </AlertBanner>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="opinion" className="form-label">Your Feedback / Review</label>
              <textarea
                id="opinion"
                rows="6"
                className="form-input"
                placeholder="Type your opinion here... (e.g. food quality, service, menu item reviews)"
                value={opinion}
                onChange={(e) => setOpinion(e.target.value)}
                disabled={submitting}
                required
                style={{ resize: 'none', lineHeight: '1.5', padding: '0.85rem 1rem' }}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting || !opinion.trim()}
              style={{ width: '100%', justifyContent: 'center', gap: '0.5rem' }}
            >
              <Send size={18} /> {submitting ? 'Submitting...' : 'Submit Feedback'}
            </button>
          </form>
        </motion.div>

        {/* History List */}
        <motion.div
          className="card-static"
          initial={fadeUp.initial}
          animate={fadeUp.animate}
          transition={{ delay: 0.12 }}
          style={{ display: 'flex', flexDirection: 'column' }}
        >
          <h2 className="section-title" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calendar className="text-accent-foreground" size={20} /> Your Feedback History
          </h2>

          {loadingHistory ? (
            <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-secondary)' }}>
              Loading history...
            </div>
          ) : feedbacks.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1.5rem', color: 'var(--text-muted)', border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexGrow: 1 }}>
              <MessageSquare size={36} style={{ marginBottom: '1rem', opacity: 0.5 }} />
              <p style={{ fontSize: '0.95rem' }}>You haven't submitted any feedback yet.</p>
              <p style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>Share your first review on the left form!</p>
            </div>
          ) : (
            <div style={{ maxHeight: '380px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', flexGrow: 1, paddingRight: '0.25rem' }} className="custom-scrollbar">
              {feedbacks.map((f) => (
                <div
                  key={f.id}
                  style={{
                    padding: '1rem',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Calendar size={12} /> {new Date(f.created_at).toLocaleString()}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', whiteSpace: 'pre-wrap', lineHeight: '1.4' }}>
                    {f.opinion}
                  </p>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Feedback;
