import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ShoppingBag, Clock, ChefHat, CheckCircle2, ArrowRight } from 'lucide-react';
import MotionButton from '../ui/MotionButton';
import SpotlightCard from '../ui/SpotlightCard';
import CountUp from '../ui/CountUp';

const ActiveOrderCard = ({ activeOrder }) => {
  const navigate = useNavigate();

  if (!activeOrder) {
    return null;
  }

  const orderNum = activeOrder.order_number ? `#${activeOrder.order_number}` : `#${activeOrder.id?.slice(0, 6)}`;
  const status = activeOrder.status || 'Pending';

  // Determine current step
  let currentStep = 1;
  if (status === 'Preparing') currentStep = 2;
  if (status === 'Completed') currentStep = 3;

  const steps = [
    { num: 1, label: 'Confirmed', icon: Clock },
    { num: 2, label: 'Preparing', icon: ChefHat },
    { num: 3, label: 'Ready for Pickup', icon: CheckCircle2 },
  ];

  const items = activeOrder.order_items || [];
  const itemsText = items.map((i) => `${i.item_name} × ${i.quantity}`).join(', ');

  return (
    <section className="dashboard-section active-order-section" aria-label="Current active order">
      <SpotlightCard
        className="active-order-card"
        spotlightColor="rgba(249, 115, 22, 0.2)"
        spotlightSize={380}
      >
        <div className="active-order-header">
          <div className="active-order-title-wrap">
            <motion.div
              className="active-order-icon-badge"
              animate={{ scale: [1, 1.06, 1] }}
              transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
            >
              <ShoppingBag size={20} className="active-order-bag-icon" />
            </motion.div>
            <div>
              <div className="active-order-heading-row">
                <span className="active-order-tag">Active Order</span>
                <span className="active-order-id">{orderNum}</span>
              </div>
              <p className="active-order-items-preview" title={itemsText}>
                {itemsText || 'Your canteen order'}
              </p>
            </div>
          </div>

          <div className="active-order-right-summary">
            <div className="active-order-total-price">
              <span>₹</span>
              <CountUp to={activeOrder.total_amount} duration={0.8} />
            </div>
            <MotionButton
              type="button"
              className="active-order-track-btn"
              onClick={() => navigate('/customer/orders')}
              whileTap={{ scale: 0.94 }}
              id="active-order-track-btn"
            >
              <span>Track Order</span>
              <ArrowRight size={15} />
            </MotionButton>
          </div>
        </div>

        {/* Stepper Visualization */}
        <div className="active-order-stepper">
          {steps.map((step, idx) => {
            const isCompleted = currentStep > step.num;
            const isCurrent = currentStep === step.num;
            const StepIcon = step.icon;

            return (
              <div key={step.num} className="stepper-track-node">
                <motion.div
                  className={`stepper-indicator ${isCompleted ? 'completed' : isCurrent ? 'active' : 'upcoming'}`}
                  animate={isCurrent ? { scale: [1, 1.03, 1] } : {}}
                  transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                >
                  <StepIcon size={14} />
                  <span>{step.label}</span>
                </motion.div>
                {idx < steps.length - 1 && (
                  <div className={`stepper-track-line ${currentStep > step.num ? 'completed' : ''}`} />
                )}
              </div>
            );
          })}
        </div>
      </SpotlightCard>
    </section>
  );
};

export default ActiveOrderCard;
