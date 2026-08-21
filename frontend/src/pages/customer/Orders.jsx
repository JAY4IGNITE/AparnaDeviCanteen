import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'motion/react';
import { Package, XCircle } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import EmptyState from '../../components/ui/EmptyState';
import LoadingState from '../../components/ui/LoadingState';
import MotionButton from '../../components/ui/MotionButton';
import { fadeUp } from '../../lib/motion';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });
  };

  if (loading) {
    return <LoadingState />;
  }

  return (
    <div>
      <PageHeader title="My Orders" subtitle="Track your past and current orders" />

      {orders.length === 0 ? (
        <EmptyState icon={Package} title="No orders yet" description="Place your first order from the menu!" scene={() => import('../../components/3d/EmptyOrders3D')} />
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
              <span className={`badge badge-${order.status.toLowerCase()}`}>
                {order.status}
              </span>
            </div>

            <div className="order-items">
              {(order.order_items || []).map((item, idx) => (
                <div className="order-item-row" key={idx}>
                  <span>{item.item_name} × {item.quantity}</span>
                  <span>₹{item.price * item.quantity}</span>
                </div>
              ))}
            </div>

            <div className="order-total" style={{ borderBottom: order.status === 'Pending' ? '1px solid var(--border-color)' : 'none', paddingBottom: order.status === 'Pending' ? '1rem' : '0' }}>
              <span>Total</span>
              <span>₹{order.total_amount}</span>
            </div>

            {order.status === 'Pending' && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <MotionButton
                  className="btn btn-danger btn-sm"
                  onClick={() => cancelOrder(order.id)}
                  id={`cancel-order-${order.id}`}
                >
                  <XCircle size={14} /> Cancel Order
                </MotionButton>
              </div>
            )}
          </motion.div>
        ))
      )}
    </div>
  );
};

export default Orders;
