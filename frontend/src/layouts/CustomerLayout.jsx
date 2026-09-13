import { useState } from 'react';
import { Outlet, useNavigate, NavLink } from 'react-router-dom';
import { motion } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutGrid, 
  UtensilsCrossed, 
  ShoppingBag, 
  Star, 
  BellDot, 
  CircleUserRound, 
  Headset, 
  Menu, 
  X 
} from 'lucide-react';
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
    { to: '/customer/home', icon: LayoutGrid, label: 'Dashboard' },
    { to: '/customer/menu', icon: UtensilsCrossed, label: 'Menu' },
    { to: '/customer/orders', icon: ShoppingBag, label: 'My Orders' },
    { to: '/customer/feedback', icon: Star, label: 'Give Feedback' },
    { to: '/customer/announcements', icon: BellDot, label: 'Announcements' },
    { section: 'SYSTEM CONTROLS' },
    { to: '/customer/profile', icon: CircleUserRound, label: 'Profile Settings' },
    { to: '/customer/support', icon: Headset, label: 'Support' },
  ];

  const bottomNavItems = [
    { to: '/customer/home', icon: LayoutGrid, label: 'Home' },
    { to: '/customer/menu', icon: UtensilsCrossed, label: 'Menu' },
    { to: '/customer/orders', icon: ShoppingBag, label: 'Orders' },
    { to: '/customer/profile', icon: CircleUserRound, label: 'Profile' },
  ];

  return (
    <div className="app-layout">
      {/* Mobile Top App Header Bar */}
      <header className="mobile-app-header">
        <motion.button
          className="mobile-menu-trigger"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          id="hamburger-toggle"
          aria-label="Toggle navigation menu"
          aria-expanded={sidebarOpen}
          whileTap={{ scale: 0.92 }}
        >
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </motion.button>
        <div className="mobile-app-brand">
          <img src="/canteen-logo.png" alt="AparnaDevi Logo" className="mobile-app-logo" />
          <span className="mobile-app-title">AparnaCanteen</span>
        </div>
        <div className="mobile-header-user">
          <span className="mobile-header-user-badge">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </span>
        </div>
      </header>

      <AppSidebar
        brand="Aparna Devi"
        subtitle="CANTEEN PORTAL"
        navLinks={navLinks}
        user={user}
        userRole={user?.role}
        onLogout={handleLogout}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        logoutId="logout-btn"
      />

      <main className="main-content customer-layout-main">
        <PageTransition>
          <div className="page-container">
            <Outlet />
          </div>
        </PageTransition>
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="mobile-bottom-nav" aria-label="Mobile Bottom Navigation">
        {bottomNavItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `mobile-bottom-item ${isActive ? 'active' : ''}`}
          >
            <Icon size={20} strokeWidth={2} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default CustomerLayout;
