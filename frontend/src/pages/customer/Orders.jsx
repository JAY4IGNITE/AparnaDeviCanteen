import { useState, useEffect } from 'react';
import axios from 'axios';
import { ClipboardList, Package } from 'lucide-react';

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

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });
  };

  if (loading) {
    return <div className="loading-spinner"><div className="spinner"></div></div>;
  }

  return (
    <div>
      <div className="page-header">
        <h1>My Orders</h1>
        <p>Track your past and current orders</p>
      </div>

      {orders.length === 0 ? (
        <div className="empty-state">
          <Package size={64} />
          <h3>No orders yet</h3>
          <p>Place your first order from the menu!</p>
        </div>
      ) : (
        orders.map(order => (
          <div className="order-card" key={order.id}>
            <div className="order-header">
              <div>
                <div className="order-id">#{order.order_number}</div>
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

            <div className="order-total">
              <span>Total</span>
              <span>₹{order.total_amount}</span>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default Orders;
