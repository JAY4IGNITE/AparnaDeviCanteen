import { useState, useEffect, useRef } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { 
  Gauge, 
  Scan, 
  BookOpen, 
  ClipboardList, 
  BarChart3, 
  Wallet, 
  UsersRound, 
  Radio, 
  MessageCircle, 
  Settings, 
  Menu, 
  X, 
  Shield, 
  BellRing 
} from 'lucide-react';
import AppSidebar from '../components/layout/AppSidebar';
import PageTransition from '../components/ui/PageTransition';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [globalAlert, setGlobalAlert] = useState(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [ordersData, setOrdersData] = useState([]);
  const { user, logout } = useAuth();
  const navigate = useNavigate();


  const prevOrdersRef = useRef([]);
  const isFirstLoadRef = useRef(true);
  const audioCtxRef = useRef(null);

  const getAudioContext = () => {
    try {
      if (!audioCtxRef.current) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          audioCtxRef.current = new AudioCtx();
        }
      }
      if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume().catch(() => {});
      }
      return audioCtxRef.current;
    } catch (e) {
      return null;
    }
  };

  // Global browser audio unlock listener
  useEffect(() => {
    const unlock = () => {
      getAudioContext();
    };
    window.addEventListener('click', unlock);
    window.addEventListener('touchstart', unlock);
    window.addEventListener('keydown', unlock);
    return () => {
      window.removeEventListener('click', unlock);
      window.removeEventListener('touchstart', unlock);
      window.removeEventListener('keydown', unlock);
    };
  }, []);

  const playTones = (ctx) => {
    try {
      const now = ctx.currentTime;
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, now);
      gain1.gain.setValueAtTime(0.35, now);
      gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.4);

      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(880, now + 0.18);
      gain2.gain.setValueAtTime(0.45, now + 0.18);
      gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.85);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.18);
      osc2.stop(now + 0.85);
    } catch (e) {
      console.warn('Tone error:', e);
    }
  };

  const playChimeSound = () => {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      if (ctx.state === 'suspended') {
        ctx.resume().then(() => playTones(ctx)).catch(() => playTones(ctx));
      } else {
        playTones(ctx);
      }
    } catch (e) {
      console.warn('Chime error:', e);
    }
  };

  const checkNewOrders = async () => {
    try {
      const res = await axios.get('/admin/orders');
      const orders = res.data.data || [];
      setOrdersData(orders);

      const pending = orders.filter(o => o.status === 'Pending' || o.status === 'Preparing').length;
      setPendingCount(pending);


      if (!isFirstLoadRef.current) {
        const newIncoming = orders.filter(
          o => !prevOrdersRef.current.some(prev => prev.id === o.id)
        );
        if (newIncoming.length > 0) {
          playChimeSound();
          setGlobalAlert({
            count: newIncoming.length,
            orderNumber: newIncoming[0]?.order_number || newIncoming[0]?.id?.substring(0, 6)
          });
          setTimeout(() => setGlobalAlert(null), 10000);
        }
      }

      prevOrdersRef.current = orders;
      isFirstLoadRef.current = false;
    } catch (err) {
      // silent fail on network glitch
    }
  };

  useEffect(() => {
    checkNewOrders();
    const interval = setInterval(checkNewOrders, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { to: '/admin/home', icon: Gauge, label: 'Dashboard' },
    { to: '/admin/counter-sale', icon: Scan, label: 'Counter Sale' },
    { to: '/admin/manage-menu', icon: BookOpen, label: 'Manage Menu' },
    { to: '/admin/orders', icon: ClipboardList, label: 'Orders', badge: pendingCount },
    { to: '/admin/statistics', icon: BarChart3, label: 'Statistics' },
    { to: '/admin/revenue', icon: Wallet, label: 'Revenue' },
    { to: '/admin/manage-customers', icon: UsersRound, label: 'Customers' },
    { to: '/admin/announcements', icon: Radio, label: 'Announcements' },
    { to: '/admin/feedbacks', icon: MessageCircle, label: 'Feedbacks' },
    { section: 'SYSTEM CONTROLS' },
    { to: '/admin/settings', icon: Settings, label: 'Settings' },
  ];

  const adminBadge = (
    <span className="badge badge-completed sidebar-admin-badge">
      <Shield size={10} /> Admin
    </span>
  );

  return (
    <div className="app-layout">
      {/* Mobile Top App Header Bar */}
      <header className="mobile-app-header">
        <motion.button
          className="mobile-menu-trigger"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          id="admin-hamburger"
          aria-label="Toggle navigation menu"
          aria-expanded={sidebarOpen}
          whileTap={{ scale: 0.92 }}
        >
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </motion.button>
        <div className="mobile-app-brand">
          <img src="/canteen-logo.png" alt="AparnaDevi Logo" className="mobile-app-logo" />
          <span className="mobile-app-title">Admin Panel</span>
        </div>
        <div className="mobile-header-user">
          <span className="badge badge-completed" style={{ fontSize: '0.65rem', padding: '0.15rem 0.4rem', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
            <Shield size={10} /> Admin
          </span>
        </div>
      </header>

      <AppSidebar
        brand="Aparna Devi"
        subtitle="ADMIN CONSOLE"
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
        {globalAlert && (
          <div
            className="new-order-toast-banner"
            style={{
              position: 'fixed',
              top: '20px',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 9999,
              cursor: 'pointer',
              minWidth: '320px',
              maxWidth: '90vw',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.75rem 1.25rem',
              borderRadius: '9999px',
              background: 'rgba(14, 11, 18, 0.95)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(249, 115, 22, 0.45)',
              boxShadow: '0 12px 36px rgba(0, 0, 0, 0.75)',
              color: '#ffffff'
            }}
            onClick={() => {
              setGlobalAlert(null);
              navigate('/admin/orders');
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <BellRing size={22} className="bell-ring-anim" />
              <div>
                <div style={{ fontWeight: 700, fontSize: '1rem' }}>
                  New Order Received! (#{globalAlert.orderNumber})
                </div>
                <div style={{ fontSize: '0.85rem', opacity: 0.95 }}>
                  {globalAlert.count} new customer order(s) arrived. Click to view.
                </div>
              </div>
            </div>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={(e) => {
                e.stopPropagation();
                setGlobalAlert(null);
              }}
              style={{ color: '#fff', border: 'none', background: 'transparent', padding: '0.25rem' }}
              aria-label="Close notification"
            >
              <X size={20} />
            </button>
          </div>
        )}
        <PageTransition>
          <div className="page-container">
            <Outlet context={{ ordersData, refreshOrders: checkNewOrders }} />
          </div>
        </PageTransition>

      </main>
    </div>
  );
};

export default AdminLayout;
