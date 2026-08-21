import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { Home, UtensilsCrossed, ClipboardList, User, HelpCircle, Menu, X, Megaphone, MessageSquarePlus } from 'lucide-react';
import AppSidebar from '../components/layout/AppSidebar';
import PageTransition from '../components/ui/PageTransition';

const CustomerLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { to: '/customer/home', icon: Home, label: 'Home' },
    { to: '/customer/menu', icon: UtensilsCrossed, label: 'Menu' },
    { to: '/customer/orders', icon: ClipboardList, label: 'My Orders' },
    { to: '/customer/feedback', icon: MessageSquarePlus, label: 'Give Feedback' },
    { to: '/customer/announcements', icon: Megaphone, label: 'Announcements' },
    { to: '/customer/profile', icon: User, label: 'Profile' },
    { to: '/customer/support', icon: HelpCircle, label: 'Support' },
  ];

  return (
    <div className="app-layout">
      <motion.button
        className="hamburger-btn"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        id="hamburger-toggle"
        aria-label="Toggle navigation menu"
        aria-expanded={sidebarOpen}
        whileTap={{ scale: 0.95 }}
      >
        {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
      </motion.button>

      <AppSidebar
        brand="AparnaCanteen"
        navLinks={navLinks}
        user={user}
        userRole={user?.role}
        onLogout={handleLogout}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        logoutId="logout-btn"
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

export default CustomerLayout;
