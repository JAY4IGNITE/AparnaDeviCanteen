import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Landing Page
import LandingPage from './pages/LandingPage';

// Auth Pages
import Login from './pages/Login';
import Register from './pages/Register';

// Customer Pages
import CustomerLayout from './layouts/CustomerLayout';
import CustomerHome from './pages/customer/Home';
import CustomerMenu from './pages/customer/Menu';
import CustomerOrders from './pages/customer/Orders';
import CustomerProfile from './pages/customer/Profile';
import CustomerSupport from './pages/customer/Support';
import CustomerAnnouncements from './pages/customer/Announcements';
import CustomerFeedback from './pages/customer/Feedback';

// Admin Pages
import AdminLayout from './layouts/AdminLayout';
import AdminHome from './pages/admin/Home';
import ManageMenu from './pages/admin/ManageMenu';
import AdminOrders from './pages/admin/Orders';
import Revenue from './pages/admin/Revenue';
import Statistics from './pages/admin/Statistics';
import ManageCustomers from './pages/admin/ManageCustomers';
import AdminAnnouncements from './pages/admin/Announcements';
import CounterSale from './pages/admin/CounterSale';
import AdminFeedbacks from './pages/admin/Feedbacks';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

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
            <Route path="" element={<Navigate to="home" replace />} />
          </Route>

          {/* Fallback Route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
