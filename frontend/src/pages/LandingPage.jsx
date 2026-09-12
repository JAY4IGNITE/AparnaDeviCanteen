import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
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
} from 'lucide-react';
import PotSteam from '../components/PotSteam';
import ColorBends from '../components/ColorBends';
import Dock from '../components/Dock';
import './LandingPage.css';

export default function LandingPage() {
  const navigate = useNavigate();

  // Normalized cursor coordinates [-0.5, 0.5] for hero 3D parallax
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Featherlight, subtle micro-parallax tracking
  const springConfig = { damping: 45, stiffness: 220, mass: 0.4 };
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [1.8, -1.8]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-2.2, 2.2]), springConfig);
  const transX = useSpring(useTransform(mouseX, [-0.5, 0.5], [-5, 5]), springConfig);
  const transY = useSpring(useTransform(mouseY, [-0.5, 0.5], [-3.5, 3.5]), springConfig);

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
      element.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
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

  return (
    <div className="landing-container min-h-screen w-full bg-[#0a0a0f] text-zinc-100 relative select-none scroll-smooth overflow-x-hidden">
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

      {/* Top Floating Minimized Dock Bar */}
      <div className="fixed top-2 sm:top-2.5 left-1/2 -translate-x-1/2 z-40 pointer-events-auto">
        <Dock
          items={navDockItems}
          panelHeight={34}
          baseItemSize={28}
          magnification={38}
          distance={100}
        />
      </div>

      {/* Top Utmost Right: Separated Sign In and Get Started (Clean Minimalist Text, No Symbols) */}
      <div className="fixed top-2.5 right-2 sm:top-3 sm:right-4 z-40 pointer-events-auto flex items-center gap-1.5 sm:gap-2 select-none">
        {/* Sign In */}
        <motion.button
          whileHover={{ scale: 1.04, y: -1 }}
          whileTap={{ scale: 0.96 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          onClick={() => navigate('/login')}
          className="px-3 py-1.5 sm:px-3.5 sm:py-1.5 text-[11px] sm:text-xs font-medium text-zinc-300 hover:text-white bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.12] hover:border-white/[0.22] rounded-full backdrop-blur-xl transition-all cursor-pointer"
        >
          Sign In
        </motion.button>

        {/* Get Started (No symbol) */}
        <motion.button
          whileHover={{ scale: 1.04, y: -1 }}
          whileTap={{ scale: 0.96 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          onClick={() => navigate('/register')}
          className="px-3.5 py-1.5 sm:px-4 sm:py-1.5 text-[11px] sm:text-xs font-semibold text-white bg-gradient-to-r from-orange-500 via-orange-600 to-amber-500 hover:from-orange-600 hover:to-amber-600 border border-orange-400/30 rounded-full shadow-[0_2px_12px_rgba(249,115,22,0.35)] hover:shadow-[0_4px_18px_rgba(249,115,22,0.55)] backdrop-blur-xl transition-all cursor-pointer"
        >
          Get Started
        </motion.button>
      </div>

      {/* SECTION 1: HERO */}
      <section
        id="home"
        onClick={() => navigate('/login')}
        className="h-screen w-screen flex items-center justify-center overflow-hidden cursor-pointer relative p-0 m-0"
      >
        {/* Dynamic ColorBends WebGL Background */}
        <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden z-0">
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
        </div>

        {/* Ambient background soft glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(249,115,22,0.18)_0%,rgba(10,10,15,0.95)_75%)] pointer-events-none z-[1]" />

        {/* 3D Perspective Character Container Responsive to Cursor */}
        <div className="relative z-10 w-full h-full flex items-center justify-center pt-8 sm:pt-14 md:pt-18 pb-4 px-2 sm:px-4 md:px-6 [perspective:1200px]">
          <motion.div
            style={{
              rotateX,
              rotateY,
              x: transX,
              y: transY,
              transformStyle: 'preserve-3d',
            }}
            whileTap={{ scale: 0.98 }}
            className="relative aspect-[2/1] w-full max-w-none max-h-[88vh] flex items-center justify-center translate-y-3 sm:translate-y-6"
          >
            {/* Main Character & Text Image */}
            <img
              src="/order-your-food.png"
              alt="Order Your Food"
              className="w-full h-full object-contain drop-shadow-[0_25px_60px_rgba(249,115,22,0.5)] select-none pointer-events-none transition-transform duration-200"
            />

            {/* Realistic Silky Continuous Steam Rising from the Pot */}
            <PotSteam />
          </motion.div>
        </div>

        {/* Bottom Left Paragraph (No boxes, no dots) */}
        <div
          onClick={(e) => {
            e.stopPropagation();
            scrollToSection('menu');
          }}
          className="absolute bottom-5 sm:bottom-7 left-4 sm:left-7 z-20 pointer-events-auto select-none cursor-pointer group max-w-[230px] sm:max-w-[290px]"
        >
          <p className="hero-statement-text text-[10px] sm:text-[11px] md:text-xs text-zinc-300/90 group-hover:text-orange-400 transition-colors drop-shadow-[0_2px_10px_rgba(0,0,0,0.95)]">
            AUTHENTIC HOME-STYLE RECIPES,
            <br />
            PREPARED FRESH DAILY WITH
            <br />
            INSTANT DIGITAL TOKENS.
          </p>
        </div>

        {/* Bottom Right Paragraph (No boxes, no dots, no timings) */}
        <div
          onClick={(e) => {
            e.stopPropagation();
            scrollToSection('contact');
          }}
          className="absolute bottom-5 sm:bottom-7 right-4 sm:right-7 z-20 pointer-events-auto select-none cursor-pointer group max-w-[230px] sm:max-w-[290px] text-right"
        >
          <p className="hero-statement-text text-[10px] sm:text-[11px] md:text-xs text-zinc-300/90 group-hover:text-amber-400 transition-colors drop-shadow-[0_2px_10px_rgba(0,0,0,0.95)]">
            SERVING DELICIOUS DAILY SPECIALS,
            <br />
            ZERO-WAIT COUNTER PICKUPS,
            <br />
            AND WHOLESOME QUALITY DINING.
          </p>
        </div>
      </section>

      {/* SECTION 2: MENU (Landing Page Feature) */}
      <section id="menu" className="relative z-20 py-20 px-4 sm:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/25 text-orange-400 text-xs font-semibold mb-3">
            <Utensils size={13} strokeWidth={1.65} />
            <span>Today's Specials</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-3">
            Explore Canteen Delicacies
          </h2>
          <p className="text-zinc-400 text-sm sm:text-base max-w-2xl mx-auto">
            Freshly prepared hot meals, crisp snacks, and beverages served daily with top hygiene and authentic flavors.
          </p>
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              name: 'Special Veg Biryani',
              price: '₹120',
              tag: 'Chef Special',
              desc: 'Slow-cooked aromatic basmati rice infused with whole spices, tender vegetables, and raita.',
            },
            {
              name: 'Ghee Podi Masala Dosa',
              price: '₹60',
              tag: 'Breakfast Favorite',
              desc: 'Golden crisp crepe roasted in pure ghee, layered with spicy podi and potato masala.',
            },
            {
              name: 'Deluxe South Thali',
              price: '₹90',
              tag: 'Full Lunch',
              desc: 'Complete meal with hot steamed rice, sambar, rasam, 2 fresh curries, papad, and curd.',
            },
            {
              name: 'Paneer Butter Masala & Roti',
              price: '₹110',
              tag: 'Dinner Star',
              desc: 'Tender cottage cheese simmered in rich creamy tomato gravy with 3 butter rotis.',
            },
          ].map((item, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -6 }}
              onClick={() => navigate('/login')}
              className="p-5 rounded-2xl bg-white/[0.04] border border-white/[0.08] hover:border-orange-500/40 hover:bg-white/[0.07] backdrop-blur-md transition-all duration-200 cursor-pointer flex flex-col justify-between group shadow-lg"
            >
              <div>
                <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/30">
                  {item.tag}
                </span>
                <h3 className="text-lg font-bold text-white mt-3 group-hover:text-orange-400 transition-colors">
                  {item.name}
                </h3>
                <p className="text-xs text-zinc-400 mt-2 line-clamp-2 leading-relaxed">
                  {item.desc}
                </p>
              </div>
              <div className="mt-5 flex items-center justify-between pt-3 border-t border-white/[0.06]">
                <span className="text-base font-extrabold text-amber-400">{item.price}</span>
                <span className="text-xs font-semibold text-orange-400 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                  Order <ArrowRight size={13} />
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-10">
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 rounded-full shadow-[0_4px_20px_rgba(249,115,22,0.35)] transition-all cursor-pointer"
          >
            View Full Digital Menu & Token System
          </button>
        </div>
      </section>

      {/* SECTION 3: FEATURES (Landing Page Feature) */}
      <section id="features" className="relative z-20 py-20 px-4 sm:px-8 max-w-7xl mx-auto border-t border-white/[0.06]">
        <div className="text-center mb-12">
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
        </div>

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
            <div
              key={idx}
              className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:border-orange-500/30 backdrop-blur-md transition-all duration-200"
            >
              <div className="p-2.5 w-fit rounded-xl bg-white/[0.05] border border-white/[0.1] mb-4">
                {feature.icon}
              </div>
              <h3 className="text-base font-bold text-white mb-2">{feature.title}</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 4: ABOUT (Landing Page Feature) */}
      <section id="about" className="relative z-20 py-20 px-4 sm:px-8 max-w-7xl mx-auto border-t border-white/[0.06]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div>
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
              <div className="px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08]">
                <div className="text-xl font-bold text-orange-400">1000+</div>
                <div className="text-xs text-zinc-400">Meals Served Daily</div>
              </div>
              <div className="px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08]">
                <div className="text-xl font-bold text-amber-400">50+</div>
                <div className="text-xs text-zinc-400">Menu Varieties</div>
              </div>
              <div className="px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08]">
                <div className="text-xl font-bold text-emerald-400">4.9 ★</div>
                <div className="text-xs text-zinc-400">Customer Rating</div>
              </div>
            </div>
          </div>

          <div className="relative rounded-3xl overflow-hidden border border-orange-500/30 shadow-[0_10px_40px_rgba(249,115,22,0.2)] bg-gradient-to-br from-orange-950/40 via-zinc-900/60 to-black/80 p-8 flex flex-col justify-center">
            <div className="text-2xl font-black text-white mb-3">AparnaDevi Promise</div>
            <p className="text-zinc-300 text-sm leading-relaxed mb-6">
              "We believe great food fuels great minds. Every recipe is crafted with care, warmth, and fresh ingredients so you always feel at home."
            </p>
            <button
              onClick={() => navigate('/register')}
              className="w-fit px-5 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 rounded-full transition-all cursor-pointer flex items-center gap-2"
            >
              Join the Canteen Community <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </section>

      {/* SECTION 5: CONTACT (Landing Page Feature) */}
      <section id="contact" className="relative z-20 py-20 px-4 sm:px-8 max-w-7xl mx-auto border-t border-white/[0.06]">
        <div className="text-center mb-12">
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
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.08] text-center flex flex-col items-center">
            <div className="p-3 rounded-full bg-orange-500/10 text-orange-400 mb-3">
              <Clock size={20} strokeWidth={1.65} />
            </div>
            <h4 className="text-sm font-bold text-white mb-1">Operating Hours</h4>
            <p className="text-xs text-zinc-400">Mon - Sat: 7:30 AM - 9:30 PM</p>
            <p className="text-xs text-zinc-400">Sunday: 8:00 AM - 8:00 PM</p>
          </div>

          <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.08] text-center flex flex-col items-center">
            <div className="p-3 rounded-full bg-amber-500/10 text-amber-400 mb-3">
              <MapPin size={20} strokeWidth={1.65} />
            </div>
            <h4 className="text-sm font-bold text-white mb-1">Campus Location</h4>
            <p className="text-xs text-zinc-400">Main Block, Ground Floor</p>
            <p className="text-xs text-zinc-400">Opposite Student Activity Center</p>
          </div>

          <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.08] text-center flex flex-col items-center">
            <div className="p-3 rounded-full bg-emerald-500/10 text-emerald-400 mb-3">
              <Phone size={20} strokeWidth={1.65} />
            </div>
            <h4 className="text-sm font-bold text-white mb-1">Direct Helpline</h4>
            <p className="text-xs text-zinc-400">+91 98765 43210</p>
            <p className="text-xs text-zinc-400">canteen@aparnadevi.edu</p>
          </div>
        </div>
      </section>

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
