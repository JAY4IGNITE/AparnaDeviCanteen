import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useMotionValue, useSpring, useTransform, useScroll } from 'motion/react';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import {
  Home,
  Utensils,
  Sparkles,
  Info,
  Phone,
  Clock,
  MapPin,
  ShieldCheck,
  Zap,
  Flame,
  ArrowRight,
  MessageCircle,
  Star,
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
        const offset = id === 'menu' || id === 'home' ? 0 : -28;
        lenisRef.current.scrollTo(element, {
          offset,
          duration: 1.35,
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
        className="h-screen w-screen flex items-center justify-center overflow-hidden relative p-0 m-0"
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
            className="relative aspect-[2/1] w-full max-w-none max-h-[92vh] sm:max-h-[95vh] flex items-end justify-center translate-y-3 sm:translate-y-5 pointer-events-auto"
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
          className="absolute bottom-16 left-2 sm:bottom-3 sm:left-3.5 z-20 pointer-events-auto select-none cursor-pointer group max-w-[170px] xs:max-w-[220px] sm:max-w-[280px]"
        >
          <p className="hero-statement-text text-[9px] xs:text-[10px] sm:text-[11px] md:text-xs text-zinc-300/90 group-hover:text-orange-400 transition-colors drop-shadow-[0_2px_10px_rgba(0,0,0,0.95)]">
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
          className="absolute bottom-16 right-2 sm:bottom-3 sm:right-3.5 z-20 pointer-events-auto select-none cursor-pointer group max-w-[170px] xs:max-w-[220px] sm:max-w-[280px] text-right"
        >
          <p className="hero-statement-text text-[9px] xs:text-[10px] sm:text-[11px] md:text-xs text-zinc-300/90 group-hover:text-amber-400 transition-colors drop-shadow-[0_2px_10px_rgba(0,0,0,0.95)]">
            SERVING DELICIOUS DAILY SPECIALS,
            <br />
            ZERO-WAIT COUNTER PICKUPS,
            <br />
            AND WHOLESOME QUALITY DINING.
          </p>
        </motion.div>
      </section>

      {/* SECTION 2: MENU (Full-Page Multi-Column GSAP Infinite Drifting Wall) */}
      <MenuScroll />

      {/* SECTION 3: FEATURES (Landing Page Feature) */}
      <motion.section
        id="features"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '0px 0px -80px 0px', amount: 0.15 }}
        variants={sectionVariants}
        className="relative z-20 py-20 px-4 sm:px-8 max-w-7xl mx-auto border-t border-white/[0.06]"
      >
        <motion.div variants={cardVariants} className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-400 text-xs font-semibold mb-3">
            <Sparkles size={13} strokeWidth={1.65} />
            <span>Smart Canteen Experience</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-3">
            Why Choose AparnaDevi Canteen?
          </h2>
          <p className="text-zinc-400 text-sm sm:text-base max-w-2xl mx-auto">
            Built to give everyone a seamless, queue-free, delicious dining journey every day.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: <Zap className="text-orange-400" size={22} strokeWidth={1.65} />,
              title: 'Instant Digital Tokens',
              desc: 'Order in seconds, receive your digital token on your phone, and avoid waiting in long queues.',
            },
            {
              icon: <Flame className="text-amber-400" size={22} strokeWidth={1.65} />,
              title: 'Piping Hot & Fresh',
              desc: 'Food prepared right when you need it with authentic recipes and zero compromise on taste.',
            },
            {
              icon: <ShieldCheck className="text-emerald-400" size={22} strokeWidth={1.65} />,
              title: '100% Hygienic Standards',
              desc: 'Strict kitchen sanitization, quality oil, and fresh campus-inspected daily supplies.',
            },
            {
              icon: <Clock className="text-orange-400" size={22} strokeWidth={1.65} />,
              title: 'Live Order Tracking',
              desc: 'Check live counter readiness so you can pick up your meal right when it comes off the stove.',
            },
          ].map((feature, idx) => (
            <motion.div
              key={idx}
              variants={cardVariants}
              className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.08] landing-smooth-card backdrop-blur-md"
            >
              <div className="p-2.5 w-fit rounded-xl bg-white/[0.05] border border-white/[0.1] mb-4">
                {feature.icon}
              </div>
              <h3 className="text-base font-bold text-white mb-2">{feature.title}</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* SECTION 4: ABOUT (Landing Page Feature) */}
      <motion.section
        id="about"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '0px 0px -80px 0px', amount: 0.15 }}
        variants={sectionVariants}
        className="relative z-20 py-20 px-4 sm:px-8 max-w-7xl mx-auto border-t border-white/[0.06]"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <motion.div variants={cardVariants}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/25 text-orange-400 text-xs font-semibold mb-3">
              <Info size={13} strokeWidth={1.65} />
              <span>About Us</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-4">
              Serving Happiness, One Plate at a Time
            </h2>
            <p className="text-zinc-400 text-sm leading-relaxed mb-4">
              AparnaDevi Canteen has been the culinary heartbeat of the campus, dedicated to preparing wholesome, nutritious, and appetizing meals for our vibrant community.
            </p>
            <p className="text-zinc-400 text-sm leading-relaxed mb-6">
              From our morning filter coffee and steaming idlis to afternoon biryanis and evening snacks, we prioritize customer happiness, quick delivery, and hygienic practices in everything we cook.
            </p>

            <div className="flex flex-wrap gap-4">
              <div className="px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] landing-smooth-card">
                <div className="text-xl font-bold text-orange-400">1000+</div>
                <div className="text-xs text-zinc-400">Meals Served Daily</div>
              </div>
              <div className="px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] landing-smooth-card">
                <div className="text-xl font-bold text-amber-400">50+</div>
                <div className="text-xs text-zinc-400">Menu Varieties</div>
              </div>
              <div className="px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] landing-smooth-card">
                <div className="text-xl font-bold text-emerald-400 flex items-center gap-1">
                  <span>4.9</span>
                  <Star size={16} className="fill-emerald-400 text-emerald-400" />
                </div>
                <div className="text-xs text-zinc-400">Customer Rating</div>
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={cardVariants}
            className="relative rounded-3xl overflow-hidden border border-orange-500/30 shadow-[0_10px_40px_rgba(249,115,22,0.2)] bg-gradient-to-br from-orange-950/40 via-zinc-900/60 to-black/80 p-8 flex flex-col justify-center landing-smooth-card"
          >
            <div className="text-2xl font-black text-white mb-3">AparnaDevi Promise</div>
            <p className="text-zinc-300 text-sm leading-relaxed mb-6">
              "We believe great food fuels great minds. Every recipe is crafted with care, warmth, and fresh ingredients so you always feel at home."
            </p>
            <button
              onClick={() => navigate('/register')}
              className="w-fit px-5 py-2.5 text-xs font-bold text-white bg-orange-500 hover:bg-orange-600 rounded-full transition-transform duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-105 active:scale-95 shadow-md shadow-orange-500/25 cursor-pointer flex items-center gap-2"
            >
              Join the Canteen Community <ArrowRight size={14} />
            </button>
          </motion.div>
        </div>
      </motion.section>

      {/* SECTION 5: CONTACT (Landing Page Feature) */}
      <motion.section
        id="contact"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '0px 0px -80px 0px', amount: 0.15 }}
        variants={sectionVariants}
        className="relative z-20 py-20 px-4 sm:px-8 max-w-7xl mx-auto border-t border-white/[0.06]"
      >
        <motion.div variants={cardVariants} className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/25 text-orange-400 text-xs font-semibold mb-3">
            <Phone size={13} strokeWidth={1.65} />
            <span>Reach Out</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-3">
            Visit Us or Contact Support
          </h2>
          <p className="text-zinc-400 text-sm sm:text-base max-w-2xl mx-auto">
            Find us on campus or get in touch for pre-orders, party catering, and customer queries.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <motion.div variants={cardVariants} className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.08] text-center flex flex-col items-center landing-smooth-card">
            <div className="p-3 rounded-full bg-orange-500/10 text-orange-400 mb-3">
              <Clock size={20} strokeWidth={1.65} />
            </div>
            <h4 className="text-sm font-bold text-white mb-1">Operating Hours</h4>
            <p className="text-xs text-zinc-400">Mon - Sat: 7:30 AM - 9:30 PM</p>
            <p className="text-xs text-zinc-400">Sunday: 8:00 AM - 8:00 PM</p>
          </motion.div>

          <motion.div variants={cardVariants} className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.08] text-center flex flex-col items-center landing-smooth-card">
            <div className="p-3 rounded-full bg-amber-500/10 text-amber-400 mb-3">
              <MapPin size={20} strokeWidth={1.65} />
            </div>
            <h4 className="text-sm font-bold text-white mb-1">Campus Location</h4>
            <p className="text-xs text-zinc-400">Main Block, Ground Floor</p>
            <p className="text-xs text-zinc-400">Opposite Student Activity Center</p>
          </motion.div>

          <motion.div variants={cardVariants} className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.08] text-center flex flex-col items-center landing-smooth-card">
            <div className="p-3 rounded-full bg-emerald-500/10 text-emerald-400 mb-3">
              <Phone size={20} strokeWidth={1.65} />
            </div>
            <h4 className="text-sm font-bold text-white mb-1">Direct Helpline</h4>
            <p className="text-xs font-semibold text-white">9491008797</p>
            <p className="text-xs text-zinc-400">canteen@aparnadevi.edu</p>
          </motion.div>
        </div>

        {/* Dedicated Password & Support Contact Box */}
        <div className="mt-8 max-w-2xl mx-auto p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left shadow-lg">
          <div>
            <p className="text-xs sm:text-sm font-medium text-zinc-300">
              If any Password related queries contact to this number
            </p>
            <div className="text-xl font-extrabold text-white tracking-wide mt-1">
              9491008797
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="tel:9491008797"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.07] hover:bg-white/[0.12] border border-white/[0.1] text-white text-xs font-bold transition-colors"
            >
              <Phone size={14} className="text-orange-400" />
              Call
            </a>
            <a
              href="https://wa.me/919491008797"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-bold transition-all shadow-[0_4px_14px_rgba(37,211,102,0.35)]"
            >
              <MessageCircle size={15} />
              WhatsApp
            </a>
          </div>
        </div>
      </motion.section>

      {/* FOOTER */}
      <footer className="relative z-20 py-8 px-4 border-t border-white/[0.08] text-center text-xs text-zinc-500">
        <div className="flex items-center justify-center gap-2 mb-2">
          <img src="/aparnadevi-logo.png" alt="AparnaDevi Logo" className="h-6 w-auto" />
          <span className="font-semibold text-zinc-400">AparnaDevi Canteen</span>
        </div>
        <p>© {new Date().getFullYear()} AparnaDevi Canteen. All rights reserved.</p>
      </footer>
    </div>
  );
}
