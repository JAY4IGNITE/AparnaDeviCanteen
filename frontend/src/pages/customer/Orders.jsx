import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'motion/react';
import { Package, XCircle, FileDown, Clock, ChefHat, CheckCircle2, ChevronRight } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import EmptyState from '../../components/ui/EmptyState';
import LoadingState from '../../components/ui/LoadingState';
import MotionButton from '../../components/ui/MotionButton';
import { fadeUp } from '../../lib/motion';
import { useAuth } from '../../context/AuthContext';


const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await axios.get('/orders/me');
      setOrders(res.data.data);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const cancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure?')) return;
    try {
      const res = await axios.put(`/orders/${orderId}/cancel`);
      if (res.data.success) {
        fetchOrders();
      }
    } catch (err) {
      console.error('Failed to cancel order:', err);
      alert(err.response?.data?.message || 'Failed to cancel order. Please try again.');
    }
  };

  const handleDownloadInvoice = async (order) => {
    setDownloadingId(order.id);
    try {
      const generateInvoice = (await import('../../components/ui/InvoiceGenerator')).default;
      await generateInvoice(order, user);
    } catch (err) {
      console.error('Failed to generate invoice:', err);
      alert('Failed to generate invoice. Please try again.');
    } finally {
      setDownloadingId(null);
    }
  };


  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });
  };

  const renderOrderTimeline = (status) => {
    if (status === 'Cancelled') {
      return (
        <div className="order-stepper-container status-cancelled">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <XCircle size={18} />
            <span>Order Cancelled</span>
          </div>
        </div>
      );
    }

    let currentStep = 1;
    if (status === 'Preparing') currentStep = 2;
    if (status === 'Completed') currentStep = 3;

    const steps = [
      { step: 1, label: 'Order Placed', icon: Clock },
      { step: 2, label: 'Preparing', icon: ChefHat },
      { step: 3, label: 'Ready / Served', icon: CheckCircle2 }
    ];

    return (
      <div className="order-stepper-container">
        {steps.map(({ step, label, icon: Icon }, idx) => {
          const isCompleted = currentStep > step;
          const isCurrent = currentStep === step;
          const statusClass = isCompleted ? 'step-completed' : isCurrent ? 'step-active' : 'step-upcoming';

          return (
            <div key={step} className="stepper-node-wrapper">
              <div className={`stepper-pill ${statusClass}`}>
                <div className="stepper-pill-icon">
                  {isCompleted ? <CheckCircle2 size={16} /> : <Icon size={16} />}
                </div>
                <span className="stepper-pill-label">{label}</span>
              </div>
              {idx < steps.length - 1 && (
                <div className={`stepper-connector ${currentStep > step ? 'active' : ''}`}>
                  <ChevronRight size={16} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  if (loading) {
    return <LoadingState />;
  }

  return (
    <div>
      <PageHeader
        title="My Orders"
        subtitle="Track your past and current orders"
        showBack={true}
        backTo="/customer/home"
      />

      {orders.length === 0 ? (
        <EmptyState icon={Package} title="No orders yet" description="Place your first order from the menu!" />
      ) : (
        orders.map((order, index) => (
          <motion.div
            key={order.id}
            className="order-card"
            initial={fadeUp.initial}
            animate={fadeUp.animate}
            transition={{ delay: index * 0.05 }}
            whileHover={{ borderColor: 'rgba(249, 115, 22, 0.3)' }}
          >
            <div className="order-header">
              <div>
                <div className="order-id" title={`Full ID: ${order.id}`}>
                  #{order.order_number}
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 'normal', marginLeft: '0.5rem', fontFamily: 'monospace' }}>
                    ({order.id.substring(0, 8)})
                  </span>
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  {formatDate(order.created_at)}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {order.payment_method && (
                  <span className="badge badge-payment">
                    {order.payment_method === 'COD' ? 'COD' : order.payment_method}
                  </span>
                )}
                <span className={`badge badge-${order.status.toLowerCase()}`}>
                  {order.status}
                </span>
              </div>
            </div>

            {/* Visual Step-by-Step Order Progress Timeline */}
            {renderOrderTimeline(order.status)}

            <div className="order-items">
              {(order.order_items || []).map((item, idx) => (
                <div className="order-item-row" key={idx}>
                  <span>{item.item_name} × {item.quantity}</span>
                  <span>₹{item.price * item.quantity}</span>
                </div>
              ))}
            </div>

            <div className="order-total">
              <span>Total</span>
              <span>₹{order.total_amount}</span>
            </div>

            <div className="order-actions">
              <MotionButton
                className="btn btn-invoice btn-sm"
                onClick={() => handleDownloadInvoice(order)}
                disabled={downloadingId === order.id}
                id={`download-invoice-${order.id}`}
              >
                {downloadingId === order.id ? (
                  <div className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />
                ) : (
                  <FileDown size={14} />
                )}
                Download Invoice
              </MotionButton>

              {order.status === 'Pending' && (
                <MotionButton
                  className="btn btn-danger btn-sm"
                  onClick={() => cancelOrder(order.id)}
                  id={`cancel-order-${order.id}`}
                >
                  <XCircle size={14} /> Cancel Order
                </MotionButton>
              )}
            </div>
          </motion.div>
        ))
      )}
    </div>
  );
};

export default Orders;
