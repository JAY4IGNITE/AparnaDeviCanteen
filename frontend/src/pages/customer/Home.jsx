import { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { motion } from 'motion/react';
import { Clock } from 'lucide-react';
import DashboardHeader from '../../components/customer/DashboardHeader';
import DashboardHero from '../../components/customer/DashboardHero';
import TrendingToday from '../../components/customer/TrendingToday';
import ActiveOrderCard from '../../components/customer/ActiveOrderCard';
import OrderAgain from '../../components/customer/OrderAgain';
import ErrorBoundary from '../../components/ui/ErrorBoundary';
import { staggerContainer, fadeUp } from '../../lib/motion';
import { checkOperatingHours } from '../../lib/operatingHours';

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

  const operatingStatus = useMemo(() => checkOperatingHours(), []);

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
        {/* Operating Hours Notice if Closed */}
        {!operatingStatus.isOpen && (
          <motion.div
            variants={fadeUp}
            className="p-3.5 mb-3 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-center gap-3 text-amber-300 text-xs sm:text-sm"
          >
            <Clock size={18} className="shrink-0 text-amber-400" />
            <div>
              <strong className="font-bold mr-1.5">Operating Notice:</strong>
              <span>{operatingStatus.message}</span>
            </div>
          </motion.div>
        )}

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
