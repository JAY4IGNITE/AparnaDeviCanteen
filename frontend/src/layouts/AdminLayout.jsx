import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Home, UtensilsCrossed, ClipboardList, DollarSign, BarChart3, Users, LogOut, Menu, X, Shield } from 'lucide-react';

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
    { to: '/admin/manage-menu', icon: UtensilsCrossed, label: 'Manage Menu' },
    { to: '/admin/orders', icon: ClipboardList, label: 'Orders' },
    { to: '/admin/revenue', icon: DollarSign, label: 'Revenue' },
    { to: '/admin/statistics', icon: BarChart3, label: 'Statistics' },
    { to: '/admin/manage-customers', icon: Users, label: 'Customers' },
  ];

  return (
    <div className="app-layout">
      {/* Hamburger Button */}
      <button className="hamburger-btn" onClick={() => setSidebarOpen(!sidebarOpen)} id="admin-hamburger">
        {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      {/* Sidebar Overlay */}
      <div className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`} onClick={() => setSidebarOpen(false)} />

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">FN</div>
          <span className="sidebar-brand">FoodNest</span>
          <span className="badge badge-completed" style={{ marginLeft: 'auto', fontSize: '0.65rem' }}>
            <Shield size={12} style={{ marginRight: '0.2rem' }} /> Admin
          </span>
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
              {user?.name?.charAt(0)?.toUpperCase() || 'A'}
            </div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{user?.name || 'Admin'}</div>
              <div className="sidebar-user-role">{user?.email}</div>
            </div>
          </div>
          <button className="sidebar-link" onClick={handleLogout} style={{ marginTop: '0.5rem', color: 'var(--danger)' }} id="admin-logout">
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

export default AdminLayout;
