import { motion, AnimatePresence } from 'motion/react';
import { NavLink } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useMotionSafe } from '../../lib/motion';

const AppSidebar = ({
  brand,
  badge,
  navLinks,
  user,
  userRole,
  onLogout,
  sidebarOpen,
  setSidebarOpen,
  hamburgerId,
  logoutId,
}) => {
  const { transition } = useMotionSafe();

  return (
    <>
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            className="sidebar-overlay open"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={transition}
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <img src="/favicon.jpg" alt="Logo" className="sidebar-logo-img" />
          </div>
          <span className="sidebar-brand">{brand}</span>
          {badge}
        </div>

        <nav className="sidebar-nav">
          {navLinks.map((link, index) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.span
                      className="sidebar-link-indicator"
                      layoutId="sidebar-active"
                      transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                    />
                  )}
                  <link.icon size={20} />
                  <span>{link.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-avatar">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{user?.name || 'User'}</div>
              <div className="sidebar-user-role">{userRole}</div>
            </div>
          </div>
          <button
            className="sidebar-link sidebar-logout"
            onClick={onLogout}
            id={logoutId}
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default AppSidebar;
