import { lazy, useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './context/AuthContext';
import LoadingState from './components/ui/LoadingState';

// Landing Page (Lazy Loaded)
const LandingPage = lazy(() => import('./pages/LandingPage'));

// Auth Pages (Lazy Loaded)
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const VerifyEmail = lazy(() => import('./pages/VerifyEmail'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));

// Customer Pages (Lazy Loaded)
const CustomerLayout = lazy(() => import('./layouts/CustomerLayout'));
const CustomerHome = lazy(() => import('./pages/customer/Home'));
const CustomerMenu = lazy(() => import('./pages/customer/Menu'));
const CustomerOrders = lazy(() => import('./pages/customer/Orders'));
const CustomerProfile = lazy(() => import('./pages/customer/Profile'));
const CustomerSupport = lazy(() => import('./pages/customer/Support'));
const CustomerAnnouncements = lazy(() => import('./pages/customer/Announcements'));
const CustomerFeedback = lazy(() => import('./pages/customer/Feedback'));

// Admin Pages (Lazy Loaded)
const AdminLayout = lazy(() => import('./layouts/AdminLayout'));
const AdminHome = lazy(() => import('./pages/admin/Home'));
const ManageMenu = lazy(() => import('./pages/admin/ManageMenu'));
const AdminOrders = lazy(() => import('./pages/admin/Orders'));
const Revenue = lazy(() => import('./pages/admin/Revenue'));
const Statistics = lazy(() => import('./pages/admin/Statistics'));
const ManageCustomers = lazy(() => import('./pages/admin/ManageCustomers'));
const AdminAnnouncements = lazy(() => import('./pages/admin/Announcements'));
const CounterSale = lazy(() => import('./pages/admin/CounterSale'));
const AdminFeedbacks = lazy(() => import('./pages/admin/Feedbacks'));
const AdminSettings = lazy(() => import('./pages/admin/Settings'));

export default function AppRoutes() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const { isAuthenticated, user, loading } = useAuth();

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (loading) {
    return <LoadingState message="Verifying credentials..." />;
  }

  const getDashboardPath = () => user?.role === 'admin' ? '/admin/home' : '/customer/home';

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify-email/:token" element={<VerifyEmail />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />

      {/* Customer Routes (Protected) */}
      <Route
        path="/customer"
        element={
          <ProtectedRoute>
            <CustomerLayout />
          </ProtectedRoute>
        }
      >
        <Route path="home" element={<CustomerHome />} />
        <Route path="menu" element={<CustomerMenu />} />
        <Route path="orders" element={<CustomerOrders />} />
        <Route path="feedback" element={<CustomerFeedback />} />
        <Route path="profile" element={<CustomerProfile />} />
        <Route path="support" element={<CustomerSupport />} />
        <Route path="announcements" element={<CustomerAnnouncements />} />
        <Route path="" element={<Navigate to="home" replace />} />
      </Route>

      {/* Admin Routes (Protected + Admin Role) */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute adminOnly>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="home" element={<AdminHome />} />
        <Route path="manage-menu" element={<ManageMenu />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="revenue" element={<Revenue />} />
        <Route path="statistics" element={<Statistics />} />
        <Route path="manage-customers" element={<ManageCustomers />} />
        <Route path="announcements" element={<AdminAnnouncements />} />
        <Route path="counter-sale" element={<CounterSale />} />
        <Route path="feedbacks" element={<AdminFeedbacks />} />
        <Route path="settings" element={<AdminSettings />} />
        <Route path="" element={<Navigate to="home" replace />} />
      </Route>

      {/* Fallback Route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
