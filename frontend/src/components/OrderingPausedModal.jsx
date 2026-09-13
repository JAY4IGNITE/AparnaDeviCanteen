import { Clock, Utensils, X, Store } from 'lucide-react';
import AnimatedModal from './ui/AnimatedModal';
import MotionButton from './ui/MotionButton';

const OrderingPausedModal = ({
  open,
  onClose,
  customMessage = '',
  operatingHoursText = 'Admin-Controlled Live Service',
  onExploreMenu,
  onBackHome
}) => {
  return (
    <AnimatedModal open={open} onClose={onClose} maxWidth="500px" title="Orders Currently Paused">
      <div style={{ position: 'relative', padding: '1.75rem 1.5rem', textAlign: 'center' }}>
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: 'rgba(255, 255, 255, 0.06)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '9999px',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          aria-label="Close dialog"
        >
          <X size={16} />
        </button>

        {/* Highlight Icon */}
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: '1.25rem',
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.18), rgba(234, 88, 12, 0.12))',
            border: '1px solid rgba(245, 158, 11, 0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.25rem',
            color: '#fbbf24',
            boxShadow: '0 8px 24px rgba(245, 158, 11, 0.12)'
          }}
        >
          <Store size={32} strokeWidth={2.1} />
        </div>

        {/* Eyebrow badge */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.25rem 0.75rem',
            borderRadius: '9999px',
            background: 'rgba(245, 158, 11, 0.1)',
            border: '1px solid rgba(245, 158, 11, 0.25)',
            fontSize: '0.72rem',
            fontWeight: 700,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            color: '#f59e0b',
            marginBottom: '0.85rem'
          }}
        >
          <Clock size={12} />
          <span>Ordering Notice</span>
        </div>

        {/* Primary Headline */}
        <h2
          style={{
            fontSize: '1.35rem',
            fontWeight: 700,
            color: 'var(--text-primary)',
            margin: '0 0 0.75rem',
            lineHeight: 1.3
          }}
        >
          Sorry, We Are Not Taking Orders Currently
        </h2>

        {/* Professional Body Message */}
        <p
          style={{
            fontSize: '0.9rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.55,
            margin: '0 0 1.25rem'
          }}
        >
          {customMessage ||
            'AparnaDevi Canteen online ordering is temporarily paused. Orders are accepted only when activated by the canteen administrator. Please check back when ordering is resumed.'}
        </p>

        {/* Schedule & Kitchen Information Card */}
        <div
          style={{
            background: 'var(--bg-elevated, rgba(255, 255, 255, 0.03))',
            border: '1px solid var(--border-color, rgba(255, 255, 255, 0.08))',
            borderRadius: '0.875rem',
            padding: '0.85rem 1rem',
            marginBottom: '1.5rem',
            textAlign: 'left',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.45rem',
            fontSize: '0.82rem'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-muted)' }}>Ordering Status:</span>
            <span style={{ fontWeight: 600, color: '#f59e0b' }}>
              ● Currently Inactive
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-muted)' }}>Service Mode:</span>
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
              {operatingHoursText}
            </span>
          </div>
        </div>

        <p
          style={{
            fontSize: '0.8rem',
            color: 'var(--text-muted)',
            margin: '0 0 1.5rem',
            lineHeight: 1.4
          }}
        >
          You are still free to browse our menu dishes, ingredients, and categories.
        </p>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
          {onBackHome && (
            <MotionButton
              type="button"
              className="btn btn-secondary"
              onClick={onBackHome}
              style={{ flex: 1, padding: '0.75rem 1rem', fontSize: '0.875rem' }}
            >
              Back to Home
            </MotionButton>
          )}
          <MotionButton
            type="button"
            className="btn btn-primary"
            onClick={onExploreMenu || onClose}
            style={{ flex: 1, padding: '0.75rem 1rem', fontSize: '0.875rem' }}
          >
            <Utensils size={15} style={{ marginRight: '0.4rem', display: 'inline' }} />
            Browse Menu
          </MotionButton>
        </div>
      </div>
    </AnimatedModal>
  );
};

export default OrderingPausedModal;
