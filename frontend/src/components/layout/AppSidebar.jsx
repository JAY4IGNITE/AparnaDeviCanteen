import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue } from 'motion/react';
import { NavLink } from 'react-router-dom';
import { LogOut, PanelLeftClose, PanelLeftOpen, ChevronRight, Sun, Moon } from 'lucide-react';
import { useMotionSafe } from '../../lib/motion';
import { useTheme } from '../../context/ThemeContext';
import { useVerticalDockItem } from '../../lib/dock';
import MotionButton from '../ui/MotionButton';

/**
 * Sidebar navigation item with vertical Apple macOS Dock magnification effect.
 */
const SidebarDockItem = ({
  item,
  mouseY,
  isCollapsed,
  hoveredLink,
  setHoveredLink,
  setSidebarOpen,
}) => {
  const itemRef = useRef(null);
  const Icon = item.icon;
  const isHovered = hoveredLink === item.to;

  // Only scale wrapper gently in collapsed mode (44px circle); in expanded mode, row width is 100% so scale is 1 to never exceed sidebar width
  const { scale } = useVerticalDockItem(itemRef, mouseY, {
    distance: 80,
    magnification: isCollapsed ? 1.06 : 1,
  });

  // Smooth dock magnification on the icon itself
  const { scale: iconScale } = useVerticalDockItem(itemRef, mouseY, {
    distance: 80,
    magnification: isCollapsed ? 1.1 : 1.15,
  });

  return (
    <motion.div
      ref={itemRef}
      style={{
        scale: isCollapsed ? scale : 1,
        transformOrigin: 'center center',
      }}
      whileTap={{ scale: 0.96 }}
      className="sidebar-link-motion-wrap"
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
              <motion.div
                className="sidebar-link-icon-wrap"
                style={{ scale: iconScale, transformOrigin: 'center center' }}
              >
                <Icon size={isCollapsed ? 20 : 19} strokeWidth={1.85} />
              </motion.div>
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
};

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
  const navMouseY = useMotionValue(Infinity);

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
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.key === '[' || e.key === ']') {
        toggleCollapse();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (isCollapsed) {
      document.body.classList.add('sidebar-is-collapsed');
    } else {
      document.body.classList.remove('sidebar-is-collapsed');
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

      {/* Floating Modern Sidebar with Vertical Dock Effect */}
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
          <MotionButton
            type="button"
            className="sidebar-collapse-btn hidden md:flex"
            onClick={toggleCollapse}
            aria-label={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            title={isCollapsed ? 'Expand Sidebar' : 'Compact Sidebar'}
            dockMagnification={1.05}
          >
            {isCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={16} />}
          </MotionButton>
        </div>

        {/* Navigation Items with Dock Magnification Wave */}
        <nav
          className="sidebar-nav"
          aria-label="Primary"
          onMouseMove={(e) => navMouseY.set(e.clientY)}
          onMouseLeave={() => navMouseY.set(Infinity)}
        >
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

            return (
              <SidebarDockItem
                key={item.to}
                item={item}
                mouseY={navMouseY}
                isCollapsed={isCollapsed}
                hoveredLink={hoveredLink}
                setHoveredLink={setHoveredLink}
                setSidebarOpen={setSidebarOpen}
              />
            );
          })}
        </nav>

        {/* Bottom Profile / Action Footer */}
        <div className="sidebar-footer">
          {/* Expanded Profile Card */}
          <div className={`sidebar-profile-card${isCollapsed ? ' sidebar-profile-card--hidden' : ''}`}>
            <div className="sidebar-profile-top">
              <div className="sidebar-avatar" title={`${userName} (${userEmail})`}>
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

              {/* Theme Toggle Pill */}
              <div
                className="sidebar-theme-toggle"
                onClick={toggleTheme}
                title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') toggleTheme();
                }}
              >
                <div className={`sidebar-theme-chip ${theme === 'light' ? 'active' : ''}`}>
                  <Sun size={13} />
                </div>
                <div className={`sidebar-theme-chip ${theme === 'dark' ? 'active' : ''}`}>
                  <Moon size={13} />
                </div>
              </div>
            </div>

            <MotionButton
              className="sidebar-logout-card-btn"
              onClick={onLogout}
              id={logoutId}
              type="button"
              dockEffect={false}
            >
              <LogOut size={16} strokeWidth={1.8} />
              <span>Sign Out</span>
            </MotionButton>
          </div>

          {/* Collapsed icon stack with Dock Effect */}
          <div className={`sidebar-profile-collapsed${isCollapsed ? '' : ' sidebar-profile-collapsed--hidden'}`}>
            <div className="sidebar-avatar" title={`${userName} (${userEmail})`}>
              {userInitial}
            </div>
            <MotionButton
              className="sidebar-collapsed-theme-btn"
              onClick={(e) => {
                e.stopPropagation();
                toggleTheme();
              }}
              id="collapsed-theme-btn"
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              type="button"
              dockMagnification={1.05}
            >
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </MotionButton>
            <MotionButton
              className="sidebar-collapsed-logout-btn"
              onClick={onLogout}
              id="sidebar-collapsed-logout"
              title="Sign Out"
              type="button"
              dockMagnification={1.05}
            >
              <LogOut size={18} strokeWidth={1.85} />
            </MotionButton>
          </div>
        </div>
      </aside>
    </>
  );
};

export default AppSidebar;
