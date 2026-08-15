import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

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

// Admin Pages
import AdminLayout from './layouts/AdminLayout';
import AdminHome from './pages/admin/Home';
import ManageMenu from './pages/admin/ManageMenu';
import AdminOrders from './pages/admin/Orders';
import Revenue from './pages/admin/Revenue';
import Statistics from './pages/admin/Statistics';
import ManageCustomers from './pages/admin/ManageCustomers';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
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
            <Route path="profile" element={<CustomerProfile />} />
            <Route path="support" element={<CustomerSupport />} />
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
            <Route path="" element={<Navigate to="home" replace />} />
          </Route>

          {/* Fallback Route */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
