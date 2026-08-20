import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { Home, UtensilsCrossed, ClipboardList, DollarSign, BarChart3, Users, Menu, X, Shield, Megaphone, Store, MessageSquarePlus } from 'lucide-react';
import AppSidebar from '../components/layout/AppSidebar';
import PageTransition from '../components/ui/PageTransition';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { to: '/admin/home', icon: Home, label: 'Dashboard' },
    { to: '/admin/counter-sale', icon: Store, label: 'Counter Sale' },
    { to: '/admin/manage-menu', icon: UtensilsCrossed, label: 'Manage Menu' },
    { to: '/admin/orders', icon: ClipboardList, label: 'Orders' },
    { to: '/admin/statistics', icon: BarChart3, label: 'Statistics' },
    { to: '/admin/revenue', icon: DollarSign, label: 'Revenue' },
    { to: '/admin/manage-customers', icon: Users, label: 'Customers' },
    { to: '/admin/announcements', icon: Megaphone, label: 'Announcements' },
    { to: '/admin/feedbacks', icon: MessageSquarePlus, label: 'Feedbacks' },
  ];

  const adminBadge = (
    <span className="badge badge-completed sidebar-admin-badge">
      <Shield size={10} /> Admin
    </span>
  );

  return (
    <div className="app-layout">
      <motion.button
        className="hamburger-btn"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        id="admin-hamburger"
        whileTap={{ scale: 0.95 }}
      >
        {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
      </motion.button>

      <AppSidebar
        brand="AparnaCanteen"
        badge={adminBadge}
        navLinks={navLinks}
        user={user}
        userRole={user?.email}
        onLogout={handleLogout}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        logoutId="admin-logout"
      />

      <main className="main-content">
        <PageTransition>
          <div className="page-container">
            <Outlet />
          </div>
        </PageTransition>
      </main>
    </div>
  );
};

export default AdminLayout;
