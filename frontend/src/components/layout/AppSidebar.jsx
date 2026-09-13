import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NavLink } from 'react-router-dom';
import { LogOut, PanelLeftClose, PanelLeftOpen, ChevronRight, Sun, Moon } from 'lucide-react';
import { useMotionSafe } from '../../lib/motion';
import { useTheme } from '../../context/ThemeContext';

const AppSidebar = ({
  brand = 'Aparna Devi',
  subtitle = 'CANTEEN PORTAL',
  badge,
  navLinks = [],
  user,
  userRole,
  onLogout,
  sidebarOpen,
  setSidebarOpen,
  logoutId = 'sidebar-logout',
}) => {
  const { transition } = useMotionSafe();
  const { theme, toggleTheme } = useTheme();
  const [isCollapsed, setIsCollapsed] = useState(() => {
    try {
      return localStorage.getItem('aparna_sidebar_collapsed') === 'true';
    } catch (e) {
      return false;
    }
  });

  const [hoveredLink, setHoveredLink] = useState(null);

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('aparna_sidebar_collapsed', String(next));
      } catch (e) {}
      return next;
    });
  };

  useEffect(() => {
    const appLayout = document.querySelector('.app-layout');
    if (appLayout) {
      if (isCollapsed) {
        appLayout.classList.add('sidebar-collapsed');
      } else {
        appLayout.classList.remove('sidebar-collapsed');
      }
    }
  }, [isCollapsed]);

  const userName = user?.name || 'Jaya Sai v';
  const userEmail = user?.email || 'vjayasai3@gmail.com';
  const userInitial = userName.charAt(0).toUpperCase() || 'V';

  return (
    <>
      {/* Mobile Drawer Backdrop Overlay */}
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

      {/* Floating Modern Sidebar matching MindVault reference */}
      <aside
        className={`sidebar theme-${theme} ${sidebarOpen ? 'open' : ''} ${isCollapsed ? 'collapsed' : ''}`}
        aria-label="Sidebar Navigation"
      >
        {/* Sidebar Header */}
        <div className="sidebar-header">
          <div className="sidebar-brand-group">
            <div className="sidebar-logo">
              <img
                src="/aparnadevi-logo.png"
                alt="Aparna Devi Canteen"
                className="sidebar-logo-img"
                onError={(e) => {
                  e.target.src = '/canteen-logo.png';
                }}
              />
            </div>
          </div>

          {/* Desktop Collapse / Expand Button */}
          <button
            type="button"
            className="sidebar-collapse-btn hidden md:flex"
            onClick={toggleCollapse}
            aria-label={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            title={isCollapsed ? 'Expand Sidebar' : 'Compact Sidebar'}
          >
            {isCollapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="sidebar-nav" aria-label="Primary">
          {navLinks.map((item, index) => {
            if (item.section) {
              if (isCollapsed) {
                return <div key={`sep-${index}`} className="sidebar-section-divider" />;
              }
              return (
                <div key={`sec-${index}`} className="sidebar-section-title">
                  {item.section}
                </div>
              );
            }

            const Icon = item.icon;
            const isHovered = hoveredLink === item.to;

            return (
              <motion.div
                key={item.to}
                whileHover={{ scale: isCollapsed ? 1.08 : 1.015 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 420, damping: 26 }}
                style={{ position: 'relative', width: '100%' }}
                onHoverStart={() => setHoveredLink(item.to)}
                onHoverEnd={() => setHoveredLink(null)}
              >
                <NavLink
                  to={item.to}
                  className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                  onClick={() => setSidebarOpen(false)}
                  id={item.id || undefined}
                >
                  {({ isActive }) => (
                    <>
                      <div className="sidebar-link-content">
                        <div className="sidebar-link-icon-wrap">
                          <Icon size={19} strokeWidth={1.85} />
                        </div>
                        <span className={`sidebar-link-label${isCollapsed ? ' sidebar-link-label--hidden' : ''}`}>
                          {item.label}
                        </span>
                      </div>

                      <div className={`sidebar-link-trailing${isCollapsed ? ' sidebar-link-trailing--hidden' : ''}`}>
                        {item.badge != null && item.badge > 0 && (
                          <span className="sidebar-badge">{item.badge}</span>
                        )}
                        <ChevronRight
                          size={16}
                          className={`sidebar-link-chevron ${isActive ? 'active' : ''}`}
                        />
                      </div>

                      {/* Tooltip in Collapsed Mode */}
                      <AnimatePresence>
                        {isCollapsed && isHovered && (
                          <motion.div
                            className="sidebar-dock-tooltip"
                            initial={{ opacity: 0, x: -6, scale: 0.95 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: -6, scale: 0.95 }}
                            transition={{ duration: 0.15 }}
                            role="tooltip"
                          >
                            <span>{item.label}</span>
                            {item.badge != null && item.badge > 0 && (
                              <span
                                style={{
                                  marginLeft: '0.45rem',
                                  background: '#f97316',
                                  color: '#fff',
                                  fontSize: '0.65rem',
                                  padding: '0.05rem 0.35rem',
                                  borderRadius: '9999px',
                                  fontWeight: 700,
                                }}
                              >
                                {item.badge}
                              </span>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </>
                  )}
                </NavLink>
              </motion.div>
            );
          })}
        </nav>

        {/* Sidebar Footer with Elevated Profile Card */}
        <div className="sidebar-footer">
          {/* Expanded profile card */}
          <div className={`sidebar-profile-card${isCollapsed ? ' sidebar-profile-card--hidden' : ''}`}>
            <div className="sidebar-profile-top">
              <div className="sidebar-avatar">
                {userInitial}
              </div>
              <div className="sidebar-user-info">
                <div className="sidebar-user-name" title={userName}>
                  {userName}
                </div>
                <div className="sidebar-user-email" title={userEmail}>
                  {userEmail}
                </div>
              </div>
              <div
                className="sidebar-theme-toggle"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleTheme();
                }}
                role="button"
                tabIndex={0}
                title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              >
                <div className={`sidebar-theme-chip ${theme === 'light' ? 'active' : ''}`}>
                  <Sun size={13} />
                </div>
                <div className={`sidebar-theme-chip ${theme === 'dark' ? 'active' : ''}`}>
                  <Moon size={13} />
                </div>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.015 }}
              whileTap={{ scale: 0.98 }}
              className="sidebar-logout-card-btn"
              onClick={onLogout}
              id={logoutId}
              type="button"
            >
              <LogOut size={16} strokeWidth={1.8} />
              <span>Sign Out</span>
            </motion.button>
          </div>

          {/* Collapsed icon stack */}
          <div className={`sidebar-profile-collapsed${isCollapsed ? '' : ' sidebar-profile-collapsed--hidden'}`}>
            <div className="sidebar-avatar" title={`${userName} (${userEmail})`}>
              {userInitial}
            </div>
            <button
              className="sidebar-collapsed-theme-btn"
              onClick={(e) => {
                e.stopPropagation();
                toggleTheme();
              }}
              id="collapsed-theme-btn"
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              type="button"
            >
              {theme === 'light' ? <Moon size={15} /> : <Sun size={15} />}
            </button>
            <button
              className="sidebar-collapsed-logout"
              onClick={onLogout}
              id={logoutId}
              title="Sign Out"
              type="button"
            >
              <LogOut size={16} strokeWidth={1.8} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default AppSidebar;
