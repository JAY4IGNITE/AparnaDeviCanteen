import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'motion/react';
import { Save, Loader2, Mail, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader from '../../components/ui/PageHeader';
import MotionButton from '../../components/ui/MotionButton';
import LoadingState from '../../components/ui/LoadingState';
import { fadeUp } from '../../lib/motion';

const AdminSettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  const [templates, setTemplates] = useState({
    preparing_email_template: `*Order Update – AparnaCanteen*

Hello [Name]!

Your *Order #[OrderNumber]* is now being *prepared in the kitchen*.

*Total Amount:* ₹[TotalAmount]

Your order will be ready shortly. Thank you for your patience!

— *AparnaCanteen*`,
    completed_email_template: `*Order Completed – AparnaCanteen*

Hello [Name]!

Your *Order #[OrderNumber]* has been *successfully completed*.

Thank you for ordering from *AparnaCanteen*!
We hope you enjoyed your meal and look forward to serving you again!

— *AparnaCanteen*`
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await axios.get('/admin/settings');
      if (res.data.success && res.data.data) {
        setTemplates(prev => ({
          ...prev,
          ...res.data.data
        }));
      }
    } catch (err) {
      console.error('Failed to fetch settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTemplates(prev => ({
      ...prev,
      [name]: value
    }));
    setSaveSuccess(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.put('/admin/settings', templates);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to save settings:', err);
      toast.error('Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingState />;
  }

  return (
    <div style={{ maxWidth: '800px' }}>
      <PageHeader 
        title="Settings" 
        subtitle="Manage automated email templates and system preferences" 
        showBack={true}
        backTo="/admin/home"
      />

      <motion.div 
        className="card"
        initial={fadeUp.initial}
        animate={fadeUp.animate}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
          <Mail size={24} color="var(--primary-400)" />
          <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Automated Order Emails</h2>
        </div>

        <div style={{ background: 'rgba(234, 88, 12, 0.05)', border: '1px solid rgba(234, 88, 12, 0.2)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
          <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--primary-400)', fontSize: '0.9rem' }}>Tip: Use Placeholders</h4>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
            You can type these exact words in your templates, and the system will magically replace them with real data before sending:
            <br />
            <strong style={{ color: '#fff' }}>[Name]</strong> - The customer's first name
            <br />
            <strong style={{ color: '#fff' }}>[OrderNumber]</strong> - The 6-digit order ID
            <br />
            <strong style={{ color: '#fff' }}>[TotalAmount]</strong> - The total price of the order
          </p>
        </div>

        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
          <label className="form-label" style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>"Preparing" Email Template</label>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
            This email is sent automatically to the customer when you click the "Start Preparing" (Chef Hat) button.
          </p>
          <textarea
            className="form-input"
            name="preparing_email_template"
            value={templates.preparing_email_template}
            onChange={handleChange}
            rows={4}
            style={{ width: '100%', resize: 'vertical' }}
          />
        </div>

        <div className="form-group" style={{ marginBottom: '2rem' }}>
          <label className="form-label" style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>"Completed" Email Template</label>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
            This email is sent automatically when you click the "Mark as Completed" (Checkmark) button.
          </p>
          <textarea
            className="form-input"
            name="completed_email_template"
            value={templates.completed_email_template}
            onChange={handleChange}
            rows={4}
            style={{ width: '100%', resize: 'vertical' }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
          <MotionButton 
            className="btn btn-primary" 
            onClick={handleSave} 
            disabled={saving}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem' }}
          >
            {saving ? <Loader2 size={18} className="spin" /> : <Save size={18} />}
            {saving ? 'Saving...' : 'Save Settings'}
          </MotionButton>
          
          {saveSuccess && (
            <motion.span 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              style={{ color: 'var(--success)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
            >
              <Check size={16} />
              <span>Saved successfully!</span>
            </motion.span>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default AdminSettings;
