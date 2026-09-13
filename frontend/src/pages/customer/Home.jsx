import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { motion } from 'motion/react';
import DashboardHeader from '../../components/customer/DashboardHeader';
import DashboardHero from '../../components/customer/DashboardHero';
import TrendingToday from '../../components/customer/TrendingToday';
import ActiveOrderCard from '../../components/customer/ActiveOrderCard';
import OrderAgain from '../../components/customer/OrderAgain';
import ErrorBoundary from '../../components/ui/ErrorBoundary';
import { staggerContainer, fadeUp } from '../../lib/motion';

const CustomerHome = () => {
  const [menuItems, setMenuItems] = useState([]);

  const [customerOrders, setCustomerOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  const fetchData = useCallback(async () => {
    setLoadingOrders(true);
    try {
      const [menuRes, ordersRes] = await Promise.allSettled([
        axios.get('/menu'),
        axios.get('/orders/me')
      ]);

      if (menuRes.status === 'fulfilled' && menuRes.value.data?.success) {
        setMenuItems(menuRes.value.data.data || []);
      }
      if (ordersRes.status === 'fulfilled' && ordersRes.value.data?.success) {
        setCustomerOrders(ordersRes.value.data.data || []);
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
