import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { motion } from 'motion/react';
import { Clock } from 'lucide-react';
import DashboardHeader from '../../components/customer/DashboardHeader';
import DashboardHero from '../../components/customer/DashboardHero';
import TrendingToday from '../../components/customer/TrendingToday';
import ActiveOrderCard from '../../components/customer/ActiveOrderCard';
import OrderAgain from '../../components/customer/OrderAgain';
import AnnouncementTicker from '../../components/customer/AnnouncementTicker';
import ErrorBoundary from '../../components/ui/ErrorBoundary';
import { useCart } from '../../context/CartContext';
import { staggerContainer, fadeUp } from '../../lib/motion';

const CustomerHome = () => {
  const { setIsPausedModalOpen, isOrdersActive, statusMessage } = useCart();
  const [menuItems, setMenuItems] = useState([]);
  const [customerOrders, setCustomerOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [serverOperatingStatus, setServerOperatingStatus] = useState(null);

  const activeStatus = serverOperatingStatus || {
    isOpen: isOrdersActive,
    message: statusMessage || 'Sorry, we are not taking orders currently. Ordering will open when activated by the admin.'
  };

  const fetchData = useCallback(async () => {
    setLoadingOrders(true);
    try {
      const [menuRes, ordersRes, statusRes] = await Promise.allSettled([
        axios.get('/menu'),
        axios.get('/orders/me'),
        axios.get('/menu/operating-status')
      ]);

      if (menuRes.status === 'fulfilled' && menuRes.value.data?.success) {
        setMenuItems(menuRes.value.data.data || []);
      }
      if (ordersRes.status === 'fulfilled' && ordersRes.value.data?.success) {
        setCustomerOrders(ordersRes.value.data.data || []);
      }
      if (statusRes.status === 'fulfilled' && statusRes.value.data?.success) {
        setServerOperatingStatus(statusRes.value.data.data);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoadingOrders(false);
    }
  }, []);


  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Find the latest active order (status 'Pending' or 'Preparing')
  const activeOrder = customerOrders.find(
    (order) => order.status === 'Pending' || order.status === 'Preparing'
  );

  return (
    <div className="customer-dashboard-root">
      {/* 1. Header with greeting, notifications, cart & profile */}
      <ErrorBoundary>
        <DashboardHeader />
      </ErrorBoundary>

      <motion.div
        className="customer-dashboard-body"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        {/* Operating Status Notice if Orders are Inactive */}
        {!activeStatus.isOpen && (
          <motion.div
            variants={fadeUp}
            onClick={() => setIsPausedModalOpen(true)}
            style={{ cursor: 'pointer' }}
            className="p-3.5 mb-3 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-between gap-3 text-amber-300 text-xs sm:text-sm hover:bg-amber-500/15 transition-colors"
            title="Click to view ordering status details"
          >
            <div className="flex items-center gap-2.5">
              <Clock size={18} className="shrink-0 text-amber-400" />
              <div>
                <strong className="font-bold mr-1.5">Ordering Notice:</strong>
                <span>{activeStatus.message || 'Sorry, we are not taking orders currently.'}</span>
              </div>
            </div>
            <span className="text-xs underline opacity-90 shrink-0">View Details</span>
          </motion.div>
        )}

        {/* Live Canteen Announcement Ticker */}
        <motion.div variants={fadeUp}>
          <ErrorBoundary>
            <AnnouncementTicker />
          </ErrorBoundary>
        </motion.div>

        {/* 2. Food-Focused Hero Banner */}
        <motion.div variants={fadeUp}>
          <ErrorBoundary>
            <DashboardHero />
          </ErrorBoundary>
        </motion.div>

        {/* 4. Active Order Live Progress (if any) */}
        {activeOrder && (
          <motion.div variants={fadeUp}>
            <ErrorBoundary>
              <ActiveOrderCard activeOrder={activeOrder} />
            </ErrorBoundary>
          </motion.div>
        )}

        {/* 6. Trending Today (Ranked by Today's India-Time Orders) */}
        <motion.div variants={fadeUp}>
          <ErrorBoundary>
            <TrendingToday />
          </ErrorBoundary>
        </motion.div>

        {/* 7. Order Again (Customer's previous favorite dishes) */}
        <motion.div variants={fadeUp}>
          <ErrorBoundary>
            <OrderAgain
              orders={customerOrders}
              allMenuItems={menuItems}
              loading={loadingOrders}
            />
          </ErrorBoundary>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default CustomerHome;
