import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Home, UtensilsCrossed, ClipboardList, User, HelpCircle, LogOut, Menu, X } from 'lucide-react';

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
    { to: '/customer/profile', icon: User, label: 'Profile' },
    { to: '/customer/support', icon: HelpCircle, label: 'Support' },
  ];

  return (
    <div className="app-layout">
      {/* Hamburger Button */}
      <button className="hamburger-btn" onClick={() => setSidebarOpen(!sidebarOpen)} id="hamburger-toggle">
        {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      {/* Sidebar Overlay */}
      <div className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`} onClick={() => setSidebarOpen(false)} />

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">ADC</div>
          <span className="sidebar-brand">AparnaDeviCanteen</span>
        </div>

        <nav className="sidebar-nav">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <link.icon size={20} />
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-avatar">
              {user?.name?.charAt(0)?.toUpperCase() || 'C'}
            </div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{user?.name || 'Customer'}</div>
              <div className="sidebar-user-role">{user?.role}</div>
            </div>
          </div>
          <button className="sidebar-link" onClick={handleLogout} style={{ marginTop: '0.5rem', color: 'var(--danger)' }} id="logout-btn">
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default CustomerLayout;
