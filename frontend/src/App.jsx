import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { CartProvider } from './context/CartContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoadingState from './components/ui/LoadingState';
import ScrollProgressBar from './components/ui/ScrollProgressBar';
import ClickSpark from './components/ClickSpark';

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


function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <ClickSpark
            sparkColor="#f97316"
            sparkSize={10}
            sparkRadius={18}
            sparkCount={8}
            duration={450}
          >
            <Router>
              <ScrollProgressBar />
              <Suspense fallback={<LoadingState />}>
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
              </Suspense>
            </Router>
          </ClickSpark>
      </CartProvider>
    </AuthProvider>
  </ThemeProvider>
);
}

export default App;
