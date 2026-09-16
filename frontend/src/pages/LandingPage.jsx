import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useMotionValue, useSpring, useTransform, useScroll } from 'motion/react';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import {
  Home,
  Utensils,
  Phone,
  Clock,
  CheckCircle2,
  Users,
  Bell,
  Zap,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react';
import PotSteam from '../components/PotSteam';
import ColorBends from '../components/ColorBends';
import Dock from '../components/Dock';
import MenuScroll from '../components/MenuScroll';
import './LandingPage.css';

export default function LandingPage() {
  const navigate = useNavigate();
  const lenisRef = useRef(null);
  const heroRef = useRef(null);


  // Smooth inertial momentum scrolling with Lenis (Apple-like friction & velocity)
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.35,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 0.9,
      touchMultiplier: 1.6,
      infinite: false,
    });
    lenisRef.current = lenis;

    let animationFrameId;
    function raf(time) {
      lenis.raf(time);
      animationFrameId = requestAnimationFrame(raf);
    }
    animationFrameId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(animationFrameId);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  // Normalized cursor coordinates [-0.5, 0.5] for hero 3D parallax
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Featherlight, silky micro-parallax tracking
  const mouseSpring = { damping: 50, stiffness: 180, mass: 0.4 };
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [1.8, -1.8]), mouseSpring);
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-2.2, 2.2]), mouseSpring);
  const transX = useSpring(useTransform(mouseX, [-0.5, 0.5], [-5, 5]), mouseSpring);
  const transY = useSpring(useTransform(mouseY, [-0.5, 0.5], [-3.5, 3.5]), mouseSpring);

  // Scroll-linked cinematic transitions for the starting page
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });

  // Soft spring smoothing on scroll progress to eliminate any scroll-wheel notch stepping
  const smoothProgress = useSpring(scrollYProgress, {
    damping: 35,
    stiffness: 160,
    mass: 0.25,
    restDelta: 0.0001,
  });

  const heroScale = useTransform(smoothProgress, [0, 0.95], [1, 0.94]);
  const heroOpacity = useTransform(smoothProgress, [0, 0.88], [1, 0]);
  const heroY = useTransform(smoothProgress, [0, 0.95], [0, 45]);
  const heroYCombined = useTransform([transY, heroY], ([ty, hy]) => (ty || 0) + (hy || 0));
  const statementOpacity = useTransform(smoothProgress, [0, 0.35], [1, 0]);
  const statementY = useTransform(smoothProgress, [0, 0.35], [0, -20]);
  const bgOpacity = useTransform(smoothProgress, [0, 0.9], [1, 0.25]);

  // Section stagger reveal animation variants
  const sectionVariants = {
    hidden: { opacity: 0, y: 35 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.85,
        ease: [0.16, 1, 0.3, 1],
        staggerChildren: 0.1,
        delayChildren: 0.05,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 22 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.65,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      const { innerWidth, innerHeight } = window;
      const x = e.clientX / innerWidth - 0.5;
      const y = e.clientY / innerHeight - 0.5;
      mouseX.set(x);
      mouseY.set(y);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      if (lenisRef.current) {
        lenisRef.current.scrollTo(element, {
          offset: 0,
          duration: 1.25,
          easing: (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),
        });
      } else {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      if (lenisRef.current) {
        lenisRef.current.scrollTo(0, {
          duration: 1.2,
          easing: (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),
        });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  // Minimized, professional dock items for landing page features
  const navDockItems = [
    {
      icon: <Home size={15} strokeWidth={1.65} />,
      label: 'Home',
      onClick: () => scrollToSection('home'),
    },
    {
      icon: <Utensils size={15} strokeWidth={1.65} />,
      label: 'Menu',
      onClick: () => scrollToSection('menu'),
    },
    {
      icon: <Users size={15} strokeWidth={1.65} />,
      label: 'Community',
      onClick: () => scrollToSection('community'),
    },
    {
      icon: <Phone size={15} strokeWidth={1.65} />,
      label: 'Contact',
      onClick: () => scrollToSection('contact'),
    },
  ];

  // Separated Auth Dock items with individual dock magnification effect
  const signInDockItem = [
    {
      isPill: true,
      text: 'Sign In',
      baseWidth: 66,
      magnificationWidth: 80,
      onClick: () => navigate('/login'),
      className: 'dock-signin-pill',
    },
  ];

  const getStartedDockItem = [
    {
      isPill: true,
      text: 'Get Started',
      baseWidth: 94,
      magnificationWidth: 110,
      onClick: () => navigate('/register'),
      className: 'dock-getstarted-pill',
    },
  ];



  return (
    <div className="landing-container min-h-screen w-full bg-[#0a0a0f] text-zinc-100 relative select-none overflow-x-hidden">
      {/* Top Utmost Left: Logo */}
      <div
        onClick={() => scrollToSection('home')}
        className="fixed top-2.5 left-2 sm:top-3 sm:left-4 z-40 flex items-center group cursor-pointer select-none"
      >
        <img
          src="/aparnadevi-logo.png"
          alt="Aparnadevi Canteen"
          className="h-7 sm:h-8 md:h-9 w-auto object-contain drop-shadow-[0_4px_18px_rgba(249,115,22,0.4)] group-hover:scale-105 transition-all duration-200"
        />
      </div>

      {/* Top Floating Minimized Dock Bar - Perfectly Centered in Viewport */}
      <div className="top-dock-container">
        <Dock
          items={navDockItems}
          panelHeight={34}
          baseItemSize={28}
          magnification={38}
          distance={100}
        />
      </div>

      {/* Top Utmost Right: Separated Sign In & Get Started buttons, each with Dock Effect */}
      <div className="fixed top-2.5 right-2 sm:top-3 sm:right-4 z-40 pointer-events-auto select-none flex items-center gap-2 sm:gap-2.5">
        <Dock
          items={signInDockItem}
          panelHeight={32}
          baseItemSize={28}
          magnification={36}
          distance={60}
          className="auth-dock-single"
        />
        <Dock
          items={getStartedDockItem}
          panelHeight={32}
          baseItemSize={28}
          magnification={36}
          distance={60}
          className="auth-dock-single"
        />
      </div>

      {/* SECTION 1: HERO (Starting Page) */}
      <section
        id="home"
        ref={heroRef}
        className="h-screen w-full max-w-full flex items-center justify-center overflow-hidden relative p-0 m-0"
      >
        {/* Dynamic ColorBends WebGL Background */}
        <motion.div
          style={{ opacity: bgOpacity }}
          className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden z-0"
        >
          <ColorBends
            rotation={90}
            speed={0.2}
            colors={['#ff4500', '#ffb703', '#f97316']}
            transparent
            autoRotate={0}
            scale={1}
            frequency={1}
            warpStrength={1}
            mouseInfluence={1}
            parallax={0.5}
            noise={0.15}
            iterations={1}
            intensity={1.5}
            bandWidth={6}
            className="w-full h-full"
          />
        </motion.div>

        {/* Ambient background soft glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(249,115,22,0.12)_0%,transparent_70%)] pointer-events-none z-[1]" />

        {/* 3D Perspective Character Container Anchored to Bottom to Prevent Any Gap */}
        <motion.div
          style={{
            opacity: heroOpacity,
            scale: heroScale,
            transformOrigin: 'center bottom',
          }}
          className="absolute bottom-0 left-0 right-0 z-10 w-full flex items-end justify-center [perspective:1200px] pointer-events-none"
        >
          <motion.div
            style={{
              rotateX,
              rotateY,
              x: transX,
              y: heroYCombined,
              transformStyle: 'preserve-3d',
              transformOrigin: 'center bottom',
            }}
            whileTap={{ scale: 0.98 }}
            className="relative aspect-[2/1] w-full max-w-none max-h-[92vh] sm:max-h-[95vh] flex items-end justify-center px-3 sm:px-0 pb-16 sm:pb-0 translate-y-0 sm:translate-y-5 pointer-events-auto"
          >
            {/* Main Character & Text Image */}
            <img
              src="/order-your-food.png"
              alt="Order Your Food"
              className="w-full h-full object-contain object-bottom drop-shadow-[0_25px_60px_rgba(249,115,22,0.5)] select-none pointer-events-none transition-transform duration-200"
            />

            {/* Realistic Silky Continuous Steam Rising from the Pot */}
            <PotSteam />
          </motion.div>
        </motion.div>

        {/* Bottom Left Paragraph (Atmost bottom left) - Dissolves smoothly on scroll */}
        <motion.div
          style={{ opacity: statementOpacity, y: statementY }}
          onClick={(e) => {
            e.stopPropagation();
            scrollToSection('menu');
          }}
          className="absolute bottom-24 left-2 sm:bottom-6 sm:left-4 z-20 pointer-events-auto select-none cursor-pointer group max-w-[108px] min-[380px]:max-w-[130px] sm:max-w-[280px]"
        >
          <p className="hero-statement-text text-[7px] min-[380px]:text-[8.5px] sm:text-[11px] md:text-xs text-zinc-300/90 group-hover:text-orange-400 transition-colors drop-shadow-[0_2px_10px_rgba(0,0,0,0.95)]">
            AUTHENTIC HOME-STYLE RECIPES,
            <br />
            PREPARED FRESH DAILY WITH
            <br />
            INSTANT DIGITAL TOKENS.
          </p>
        </motion.div>

        {/* Bottom Right Paragraph (Atmost bottom right) - Dissolves smoothly on scroll */}
        <motion.div
          style={{ opacity: statementOpacity, y: statementY }}
          onClick={(e) => {
            e.stopPropagation();
            scrollToSection('contact');
          }}
          className="absolute bottom-24 right-2 sm:bottom-6 sm:right-4 z-20 pointer-events-auto select-none cursor-pointer group max-w-[108px] min-[380px]:max-w-[130px] sm:max-w-[280px] text-right"
        >
          <p className="hero-statement-text text-[7px] min-[380px]:text-[8.5px] sm:text-[11px] md:text-xs text-zinc-300/90 group-hover:text-amber-400 transition-colors drop-shadow-[0_2px_10px_rgba(0,0,0,0.95)]">
            SERVING DELICIOUS SPECIALS,
            <br />
            ZERO-WAIT COUNTER PICKUPS,
            <br />
            WHOLESOME QUALITY DINING.
          </p>
        </motion.div>
      </section>

      {/* SECTION 2: MENU (Full-Page Multi-Column GSAP Infinite Drifting Wall) */}
      <MenuScroll />


      {/* SECTION 4: COMMUNITY (WhatsApp Community QR & VIP Pass) */}
      <motion.section
        id="community"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '0px 0px -80px 0px', amount: 0.15 }}
        variants={sectionVariants}
        className="relative z-20 min-h-screen w-full flex items-center justify-center py-20 px-4 sm:px-8 lg:px-12 border-t border-white/[0.08] overflow-hidden"
      >
        {/* Background ambient emerald backlight aura */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[400px] bg-emerald-500/[0.05] rounded-full blur-[130px] pointer-events-none" />

        <div className="relative max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
          {/* Left Column: Community Perks & Bento Grid */}
          <motion.div variants={cardVariants} className="lg:col-span-7">

            {/* Impactful Title in Bebas Neue */}
            <h2
              className="text-4xl sm:text-6xl lg:text-7xl font-normal tracking-wide text-white mb-4 uppercase leading-[0.95]"
              style={{ fontFamily: "'Bebas Neue', cursive, sans-serif" }}
            >
              JOIN OUR{' '}
              <span className="text-[#25D366]">
                WHATSAPP COMMUNITY
              </span>
            </h2>

            {/* Subtitle */}
            <p className="text-zinc-400 text-sm sm:text-base leading-relaxed mb-8 max-w-xl">
              Connect with fellow campus foodies. Get instant live menu announcements, active ordering alerts, secret chef specials, and student combo deals directly on your phone.
            </p>

            {/* 2x2 Bento Feature Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-8">
              <div className="p-4 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] hover:border-emerald-500/30 transition-all duration-300 group">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3">
                  <Bell size={18} />
                </div>
                <h3
                  className="text-lg text-white mb-1 tracking-wider uppercase leading-none"
                  style={{ fontFamily: "'Bebas Neue', cursive, sans-serif" }}
                >
                  LIVE DAILY SPECIALS
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  First-look alerts for biryani batches, fresh snacks, and weekly specials.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] hover:border-amber-500/30 transition-all duration-300 group">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-3">
                  <Zap size={18} />
                </div>
                <h3
                  className="text-lg text-white mb-1 tracking-wider uppercase leading-none"
                  style={{ fontFamily: "'Bebas Neue', cursive, sans-serif" }}
                >
                  ZERO-QUEUE COUNTER CALLS
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Real-time status updates so you pick up piping-hot meals with minimum wait.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] hover:border-emerald-500/30 transition-all duration-300 group">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3">
                  <Sparkles size={18} />
                </div>
                <h3
                  className="text-lg text-white mb-1 tracking-wider uppercase leading-none"
                  style={{ fontFamily: "'Bebas Neue', cursive, sans-serif" }}
                >
                  SECRET COMBO DROPS
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Member-exclusive pricing, combo vouchers, and festival discounts.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] hover:border-teal-500/30 transition-all duration-300 group">
                <div className="w-9 h-9 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center mb-3">
                  <CheckCircle2 size={18} />
                </div>
                <h3
                  className="text-lg text-white mb-1 tracking-wider uppercase leading-none"
                  style={{ fontFamily: "'Bebas Neue', cursive, sans-serif" }}
                >
                  100% VERIFIED & SPAM-FREE
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Admin-managed updates strictly focused on food drops, active order slots, and canteen service.
                </p>
              </div>
            </div>

          </motion.div>

          {/* Right Column: Professional WhatsApp QR Card */}
          <motion.div variants={cardVariants} className="lg:col-span-5 flex justify-center">
            <div className="w-full max-w-sm rounded-2xl bg-[#121316] border border-zinc-800/80 p-6 flex flex-col items-center shadow-2xl">
              
              {/* Header: Official WhatsApp Horizontal Logo */}
              <div className="w-full flex items-center justify-between pb-4 mb-5 border-b border-zinc-800/80">
                <img
                  src="/whatsapp-logo.png"
                  alt="WhatsApp"
                  className="h-6 sm:h-7 object-contain"
                />
                <span className="text-[11px] font-medium text-zinc-400 tracking-wider uppercase">
                  Scan to Join
                </span>
              </div>

              {/* QR Code Container */}
              <div className="p-3 bg-white rounded-xl shadow-md border border-zinc-200/50 mb-4">
                <img
                  src="/whatsapp-qr.jpg.jpeg"
                  alt="WhatsApp Community QR Code"
                  className="w-48 h-48 sm:w-52 sm:h-52 object-contain select-none block"
                />
              </div>

              {/* Instructional Prompt */}
              <div className="text-center mb-4">
                <p className="text-xs font-semibold text-white mb-0.5">
                  Scan with your phone camera
                </p>
                <p className="text-[11px] text-zinc-400">
                  Join the official group for live menu & token updates
                </p>
              </div>

              {/* Clean CTA Button */}
              <a
                href="https://chat.whatsapp.com/IHM8VcxiERE9beVp64zFDQ"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-4 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-zinc-950 font-semibold text-xs tracking-wide transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <img
                  src="/whatsapp-icon.png"
                  alt=""
                  className="w-4 h-4 object-contain brightness-0"
                />
                <span>Open in WhatsApp</span>
                <ArrowUpRight size={14} className="opacity-75" />
              </a>

              {/* Trust Details */}
              <div className="flex items-center justify-center gap-3 text-[11px] text-zinc-500 mt-4 pt-3.5 border-t border-zinc-800/60 w-full">
                <span>Free to join</span>
                <span className="w-1 h-1 rounded-full bg-zinc-700" />
                <span>No spam</span>
                <span className="w-1 h-1 rounded-full bg-zinc-700" />
                <span>Leave anytime</span>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* SECTION 5: CONTACT & FOOTER (Combined Finale Block) */}
      <motion.section
        id="contact"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '0px 0px -80px 0px', amount: 0.15 }}
        variants={sectionVariants}
        className="relative z-20 min-h-screen w-full flex flex-col justify-between border-t border-white/[0.08] bg-gradient-to-b from-transparent via-[#090a0f] to-[#050608] overflow-hidden pt-20 pb-4"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-8 w-full my-auto">
          {/* Section Header */}
          <motion.div variants={cardVariants} className="text-center mb-8">
            <h2
              className="text-4xl sm:text-6xl lg:text-7xl font-normal tracking-wide text-white uppercase leading-[0.95]"
              style={{ fontFamily: "'Bebas Neue', cursive, sans-serif" }}
            >
              VISIT US OR <span className="text-orange-400">CONTACT SUPPORT</span>
            </h2>
          </motion.div>

          {/* Cards Grid: Operating Hours & Direct Helpline */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-4xl mx-auto mb-5">
            <motion.div variants={cardVariants} className="p-6 sm:p-7 rounded-2xl bg-white/[0.03] hover:bg-white/[0.05] border border-white/[0.08] hover:border-orange-500/30 transition-all duration-300 text-center flex flex-col items-center group shadow-lg">
              <div className="w-11 h-11 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center mb-3.5 group-hover:scale-105 transition-transform">
                <Clock size={20} strokeWidth={1.75} />
              </div>
              <h3
                className="text-xl sm:text-2xl text-white mb-1.5 tracking-wider uppercase leading-none"
                style={{ fontFamily: "'Bebas Neue', cursive, sans-serif" }}
              >
                CANTEEN SERVICE
              </h3>
              <p className="text-sm font-semibold text-orange-400 mb-0.5">Admin-Activated Live Ordering</p>
              <p className="text-xs text-zinc-400">Orders accepted during active canteen slots</p>
            </motion.div>

            <motion.div variants={cardVariants} className="p-6 sm:p-7 rounded-2xl bg-white/[0.03] hover:bg-white/[0.05] border border-white/[0.08] hover:border-emerald-500/30 transition-all duration-300 text-center flex flex-col items-center group shadow-lg">
              <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3.5 group-hover:scale-105 transition-transform">
                <Phone size={20} strokeWidth={1.75} />
              </div>
              <h3
                className="text-xl sm:text-2xl text-white mb-1.5 tracking-wider uppercase leading-none"
                style={{ fontFamily: "'Bebas Neue', cursive, sans-serif" }}
              >
                DIRECT HELPLINE
              </h3>
              <p className="text-sm font-semibold text-white mb-0.5">+91 94910 08797</p>
              <p className="text-xs text-zinc-400">canteen@aparnadevi.edu</p>
            </motion.div>
          </div>

          {/* Dedicated Password & Support Contact Box */}
          <div className="max-w-4xl mx-auto w-full p-5 sm:p-6 rounded-2xl bg-[#121316] border border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-5 text-center sm:text-left shadow-xl mb-6">
            <div>
              <h3
                className="text-xl sm:text-2xl text-white tracking-wider uppercase leading-none mb-1.5"
                style={{ fontFamily: "'Bebas Neue', cursive, sans-serif" }}
              >
                PASSWORD & ACCOUNT QUERIES
              </h3>
              <p className="text-xs text-zinc-400 mb-1">
                For login, password resets, or canteen inquiries, connect directly:
              </p>
              <div
                className="text-2xl sm:text-3xl text-orange-400 tracking-wider"
                style={{ fontFamily: "'Bebas Neue', cursive, sans-serif" }}
              >
                9491008797
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <a
                href="tel:9491008797"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.1] text-white text-xs font-semibold tracking-wide transition-colors cursor-pointer"
              >
                <Phone size={14} className="text-orange-400" />
                <span>Call</span>
              </a>
              <a
                href="https://wa.me/919491008797"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-zinc-950 text-xs font-semibold tracking-wide transition-colors cursor-pointer shadow-sm"
              >
                <img src="/whatsapp-icon.png" alt="" className="w-3.5 h-3.5 object-contain brightness-0" />
                <span>WhatsApp</span>
              </a>
            </div>
          </div>
        </div>

        {/* FULL-WIDTH FOOTER: Spanning left-most and right-most corners */}
        <footer className="w-full border-t border-white/[0.08] mt-auto pt-5 pb-3 px-4 sm:px-8 lg:px-12 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-400">
          <div className="flex items-center gap-3">
            <img
              src="/aparnadevi-logo.png"
              alt="AparnaDevi Canteen"
              className="h-6 w-auto object-contain cursor-pointer opacity-90 hover:opacity-100 transition-opacity"
              onClick={() => scrollToSection('home')}
            />
            <span className="text-zinc-700 hidden sm:inline">|</span>
            <span className="text-[11px] text-zinc-500">
              © {new Date().getFullYear()} AparnaDevi Canteen. All rights reserved.
            </span>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-zinc-500">
            <span>Developed by</span>
            <a
              href="https://github.com/PavanputraYarramsetty"
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-300 hover:text-white font-medium transition-colors underline-offset-4 hover:underline cursor-pointer"
            >
              Pavanputra
            </a>
            <span className="text-zinc-700">|</span>
            <a
              href="https://github.com/JAY4IGNITE"
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-300 hover:text-white font-medium transition-colors underline-offset-4 hover:underline cursor-pointer"
            >
              Krishna
            </a>
          </div>
        </footer>
      </motion.section>
    </div>
  );
}
