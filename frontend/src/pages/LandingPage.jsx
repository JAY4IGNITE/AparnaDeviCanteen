import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useInView, useScroll, useTransform } from 'motion/react';
import {
  ArrowRight, UtensilsCrossed, Clock, Star, ShieldCheck,
  ChefHat, Sparkles, Users, ShoppingBag, Zap,
  Smartphone, Bell, Heart, ChevronDown, ChevronRight,
  Phone, MessageCircle
} from 'lucide-react';
import MotionButton from '../components/ui/MotionButton';
import { useMotionSafe } from '../lib/motion';
import './LandingPage.css';
import './StarsBackground.css';

/* ─── Animated counter ─── */
const AnimatedCounter = ({ target, suffix = '' }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const duration = 2000;
    const step = Math.ceil(target / (duration / 16));
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(start);
    }, 16);
    return () => clearInterval(timer);
  }, [isInView, target]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
};

/* ─── FAQ Accordion Item ─── */
const FaqItem = ({ q, a }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className={`lp-faq-item ${open ? 'open' : ''}`}>
      <button className="lp-faq-question" onClick={() => setOpen(!open)}>
        <span>{q}</span>
        <ChevronDown size={20} className={`lp-faq-chevron ${open ? 'rotated' : ''}`} />
      </button>
      <div className={`lp-faq-answer ${open ? 'expanded' : ''}`}>
        <p>{a}</p>
      </div>
    </div>
  );
};

/* ─── Scrolling Tags (marquee-style) ─── */
const ScrollingTags = () => {
  const tags = [
    'Fresh Meals', 'Quick Ordering', 'Daily Specials', 'Hygienic Kitchen',
    'Student Discounts', 'Fast Pickup', 'Digital Menu', 'Easy Payments',
  ];
  return (
    <div className="lp-marquee-wrap">
      <div className="lp-marquee-track">
        {[...tags, ...tags].map((tag, i) => (
          <span key={i} className="lp-marquee-tag">{tag}</span>
        ))}
      </div>
    </div>
  );
};

const LandingPage = () => {
  const navigate = useNavigate();
  const { transition } = useMotionSafe();

  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll();
  const heroScale = useTransform(scrollYProgress, [0, 0.4], [1, 1.08]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.45], [1, 0]);
  const starsOpacity = useTransform(scrollYProgress, [0.12, 0.25], [0, 1]);

  const benefits = [
    { icon: UtensilsCrossed, title: 'Fresh & Delicious', desc: 'Enjoy freshly prepared homestyle meals made with love, served hot every day.' },
    { icon: Clock, title: 'Quick Ordering', desc: 'Skip the queue — order from your phone and pick up when it\'s ready.' },
    { icon: Star, title: 'Daily Specials', desc: 'Exciting new dishes and combos every day. Never get bored of the menu.' },

  ];

  const faqs = [
    { q: 'How do I place an order?', a: 'Sign up or log in, browse the menu, add items to your cart, and place your order.' },
    { q: 'What payment methods are accepted?', a: 'Currently accepting COD only.' },
    { q: 'Can I see today\'s menu before ordering?', a: 'Yes! The menu is updated daily with available items, specials, and combos. Just log in and check the Menu page.' },
    { q: 'How will I know when my order is ready?', a: 'The order status in My Orders shows Preparing.' },
    { q: 'Is there a minimum order amount?', a: 'No minimum order. You can order a single chai or a full meal — it\'s up to you!' },
    { q: 'How do I contact support?', a: 'Call or WhatsApp us at 9603649488. We\'re happy to help with any queries.' },
  ];

  return (
    <div className="lp">
      {/* Animated stars background starting from Benefits section */}
      <motion.div className="stars-container" style={{ opacity: starsOpacity }}>
        <div id="stars"></div>
        <div id="stars2"></div>
        <div id="stars3"></div>
      </motion.div>

      {/* ─── Navbar ─── */}
      <nav className="lp-nav">
        <div className="lp-nav-inner">
          <div className="lp-nav-brand">
            <img src="/favicon.jpg" alt="Aparna Canteen" className="lp-nav-logo" />
            <span className="lp-nav-name">AparnaCanteen</span>
          </div>
          <div className="lp-nav-links">
            <a href="#benefits" className="lp-nav-link">Benefits</a>
            <a href="#how-it-works" className="lp-nav-link">How It Works</a>
            <a href="#features" className="lp-nav-link">Features</a>
            <a href="#faq" className="lp-nav-link">FAQ</a>
          </div>
          <MotionButton
            className="btn btn-primary lp-nav-cta"
            onClick={() => navigate('/login')}
            id="nav-get-started"
          >
            Get Started
          </MotionButton>
          {/* Mobile menu button */}
          <button className="lp-nav-mobile-btn" onClick={() => navigate('/login')}>
            Get Started <ArrowRight size={16} />
          </button>
        </div>
      </nav>

      {/* ─── Hero Section ─── */}
      <section className="lp-hero" ref={heroRef}>
        <motion.div
          className="lp-hero-bg"
          style={{ scale: heroScale, opacity: heroOpacity }}
        >
          <img src="/landing-hero.jpg" alt="" className="lp-hero-bg-img" />
          <div className="lp-hero-bg-overlay" />
        </motion.div>

        <div className="lp-hero-content">
          <motion.h1
            className="lp-hero-title"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...transition, delay: 0.2 }}
          >
            Delicious Meals, Delivered Fresh
            <br />
            <span className="lp-gradient-text">Right From Our Kitchen.</span>
          </motion.h1>

          <motion.p
            className="lp-hero-desc"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...transition, delay: 0.35 }}
          >
            Order your favourite homestyle meals, daily specials, and snacks — all at your fingertips.
            Skip the queue and enjoy fresh food effortlessly.
          </motion.p>

          <motion.div
            className="lp-hero-actions"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...transition, delay: 0.5 }}
          >
            <MotionButton
              className="btn btn-primary btn-lg lp-btn-hero"
              onClick={() => navigate('/login')}
              id="landing-get-started"
            >
              Get Started <ArrowRight size={20} />
            </MotionButton>
            <a href="#benefits" className="lp-btn-secondary-link">
              Learn More <ChevronRight size={18} />
            </a>
          </motion.div>

          <motion.div
            className="lp-hero-tags"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ ...transition, delay: 0.65 }}
          >
            <ScrollingTags />
          </motion.div>
        </div>
      </section>



      {/* ─── Benefits Grid ─── */}
      <section className="lp-section" id="benefits">
        <motion.div
          className="lp-section-header"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={transition}
        >
          <span className="lp-section-tag">Benefits</span>
          <h2 className="lp-section-title">Why Students Love Us</h2>
          <p className="lp-section-desc">
            Discover how AparnaCanteen makes campus dining effortless, delicious, and affordable.
          </p>
        </motion.div>

        <div className="lp-benefits-grid">
          {benefits.map((b, i) => (
            <motion.div
              key={b.title}
              className="lp-benefit-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ ...transition, delay: i * 0.08 }}
            >
              <div className="lp-benefit-icon">
                <b.icon size={24} />
              </div>
              <h3>{b.title}</h3>
              <p>{b.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── Features Showcase ─── */}
      <section className="lp-features-showcase" id="features">
        <div className="lp-features-inner">
          <motion.div
            className="lp-section-header"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={transition}
          >
            <span className="lp-section-tag">Features</span>
            <h2 className="lp-section-title">Everything You Need</h2>
            <p className="lp-section-desc">
              A seamless food ordering experience built for speed and convenience.
            </p>
          </motion.div>

          <div className="lp-features-list">
            {[
              { icon: Smartphone, title: 'Mobile-First Design', desc: 'Order from any device — phone, tablet, or desktop. Optimized for your screen.' },
              { icon: Zap, title: 'Instant Updates', desc: 'Real-time order status tracking from placement to pickup.' },
              { icon: ShoppingBag, title: 'Easy Cart', desc: 'Add items, adjust quantities, and checkout in just a few taps.' },
              { icon: Users, title: 'Community', desc: 'Join our WhatsApp community for daily menu updates and exclusive offers.' },
            ].map((f, i) => (
              <motion.div
                key={f.title}
                className="lp-feature-row"
                initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ ...transition, delay: i * 0.1 }}
              >
                <div className="lp-feature-row-icon">
                  <f.icon size={24} />
                </div>
                <div className="lp-feature-row-content">
                  <h3>{f.title}</h3>
                  <p>{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── How It Works ─── */}
      <section className="lp-section" id="how-it-works">
        <motion.div
          className="lp-section-header"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={transition}
        >
          <span className="lp-section-tag">Process</span>
          <h2 className="lp-section-title">Getting Started Steps</h2>
          <p className="lp-section-desc">
            From sign-up to enjoying your meal — it's just 3 simple steps.
          </p>
        </motion.div>

        <div className="lp-steps">
          {[
            { num: '01', title: 'Sign Up & Log In', desc: 'Create your account in seconds with your phone number. Quick and easy.' },
            { num: '02', title: 'Browse & Order', desc: 'Explore the daily menu, pick your favourites, and place your order instantly.' },
            { num: '03', title: 'Pick Up & Enjoy', desc: 'Get notified when your order is ready. Walk in, pick up, and enjoy!' },
          ].map((s, i) => (
            <motion.div
              key={s.num}
              className="lp-step-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ ...transition, delay: i * 0.15 }}
            >
              <div className="lp-step-num">{s.num}</div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>


      {/* ─── FAQ ─── */}
      <section className="lp-section" id="faq">
        <motion.div
          className="lp-section-header"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={transition}
        >
          <span className="lp-section-tag">FAQ's</span>
          <h2 className="lp-section-title">Frequently Asked Questions</h2>
        </motion.div>

        <motion.div
          className="lp-faq-list"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={transition}
        >
          {faqs.map((faq, i) => <FaqItem key={i} q={faq.q} a={faq.a} />)}
        </motion.div>
      </section>

      {/* ─── CTA Section ─── */}
      <section className="lp-cta">
        <motion.div
          className="lp-cta-card"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={transition}
        >
          <ChefHat size={48} className="lp-cta-icon" />
          <h2>Join Us Today</h2>
          <p>Take the first step towards effortless campus dining — sign up now and start ordering.</p>
          <div className="lp-cta-perks">
            <span><Zap size={14} /> Instant Access</span>
            <span><Star size={14} /> Daily Specials</span>
            <span><Clock size={14} /> Quick Setup</span>
          </div>
          <MotionButton
            className="btn btn-primary btn-lg lp-btn-hero"
            onClick={() => navigate('/login')}
            id="cta-get-started"
          >
            Get Started Now <ArrowRight size={20} />
          </MotionButton>
        </motion.div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="lp-footer">
        <div className="lp-footer-inner">
          <div className="lp-footer-brand-col">
            <div className="lp-footer-brand">
              <img src="/favicon.jpg" alt="Aparna Canteen" className="lp-footer-logo" />
              <span>AparnaCanteen</span>
            </div>
            <p className="lp-footer-tagline">Delicious meals, fresh daily, right at your fingertips.</p>
            <div className="lp-footer-contact">
              <a href="tel:9603649488" className="lp-footer-contact-link">
                <Phone size={14} /> 9603649488
              </a>
              <a href="https://wa.me/919603649488" target="_blank" rel="noopener noreferrer" className="lp-footer-contact-link lp-whatsapp">
                <MessageCircle size={14} /> WhatsApp
              </a>
            </div>
          </div>
          <div className="lp-footer-links-col">
            <h4>Quick Links</h4>
            <a href="#benefits">Benefits</a>
            <a href="#how-it-works">How It Works</a>
            <a href="#features">Features</a>
            <a href="#faq">FAQ</a>
          </div>
          <div className="lp-footer-links-col">
            <h4>Get Started</h4>
            <a href="/login" onClick={e => { e.preventDefault(); navigate('/login'); }}>Sign In</a>
            <a href="/register" onClick={e => { e.preventDefault(); navigate('/register'); }}>Create Account</a>
          </div>
        </div>
        <div className="lp-footer-bottom">
          <p>&copy; {new Date().getFullYear()} AparnaCanteen. Made with ❤️ for students.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
