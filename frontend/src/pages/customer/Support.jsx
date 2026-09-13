import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Phone,
  MessageCircle,
  Clock,
  MapPin,
  Search,
  ChevronDown,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Copy,
  Check,
  ChefHat,
  ShieldCheck,
  UserCheck,
  CreditCard,
  Utensils,
  ArrowRight,
  X
} from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import { fadeUp } from '../../lib/motion';

const SUPPORT_CONTACTS = [
  {
    id: 'manager',
    role: 'Canteen In-charge & Manager',
    badge: 'Management',
    name: 'Canteen Owner',
    phone: '9603649488',
    hours: '7:30 AM – 10:00 PM',
    description: 'Direct line for urgent order escalations, billing questions, and manager approvals.',
    icon: UserCheck,
    options: ['call', 'whatsapp'],
    whatsappMsg: 'Hi Aparna Devi Canteen Manager, I need assistance with my order.',
  },
  {
    id: 'kitchen',
    role: 'Live Counter & Kitchen Team',
    badge: 'Live Kitchen',
    name: 'Counter Desk',
    phone: '9989092333',
    hours: '7:30 AM – 10:00 PM',
    description: 'Immediate updates on preparation time, token collection, and food customization.',
    icon: ChefHat,
    options: ['call', 'whatsapp'],
    whatsappMsg: 'Hi Kitchen Desk, I am inquiring about my live food order preparation.',
  },
  {
    id: 'admin',
    role: 'Technical & Payments Support',
    badge: 'Tech Support',
    name: 'System Admin',
    phone: '9491008797',
    hours: '9:00 AM – 9:00 PM',
    description: 'UPI transaction status, portal issues, account access, and refund reconciliation.',
    icon: ShieldCheck,
    options: ['whatsapp'],
    whatsappMsg: 'Hi Support, I need help regarding a payment / portal issue on the canteen website.',
  },
];

const ISSUE_TYPES = [
  {
    id: 'payment',
    label: 'Payment debited but order not confirmed',
    target: 'admin',
    contactNumber: '9491008797',
    icon: CreditCard,
    resolution: 'UPI payment gateways occasionally take up to 2-4 minutes to verify bank settlement. If your order status does not update, please note down your bank UTR / Ref Number. Unfulfilled transactions are auto-reversed within 2-4 hours by your bank.',
    suggestedAction: 'Send your UTR number & Order amount to our Admin on WhatsApp for instant manual verification.',
  },
  {
    id: 'delay',
    label: 'Preparation delayed beyond estimated time',
    target: 'kitchen',
    contactNumber: '9989092333',
    icon: Clock,
    resolution: 'During peak rush hours (Lunch 12:30–2:00 PM and Evening 5:00–6:30 PM), fresh preparation may take a few extra minutes. Check your live Token status on the Orders page.',
    suggestedAction: 'Contact the Live Counter Desk directly with your Token Number for immediate kitchen priority.',
  },
  {
    id: 'wrong_item',
    label: 'Missing item or incorrect food received',
    target: 'manager',
    contactNumber: '9603649488',
    icon: Utensils,
    resolution: 'We sincerely apologize for any mix-up. If an item is missing or incorrect, show your digital token or bill at Counter 1 for instant on-the-spot replacement or counter refund.',
    suggestedAction: 'Call or WhatsApp the Canteen Manager to arrange an immediate replacement or adjustment.',
  },
  {
    id: 'refund',
    label: 'Cancellation or refund inquiry',
    target: 'admin',
    contactNumber: '9491008797',
    icon: AlertCircle,
    resolution: 'Orders in "Pending" status can be canceled with manager approval. Once cooking begins ("Preparing"), cancellation is not available. Approved refunds are credited within 1-2 business days.',
    suggestedAction: 'Message Admin on WhatsApp with your Order ID and cancellation reason.',
  },
];

const FAQS = [
  {
    q: 'How do I pick up my food when it is ready?',
    category: 'Orders & Pickup',
    a: 'When your order is prepared, your token number will be marked as "Ready for Pickup" on your Orders screen. Simply visit Counter 1 or 2 at the canteen food court and present your digital token or Order ID to receive your freshly packed tray.',
  },
  {
    q: 'What should I do if money was deducted but order failed?',
    category: 'Payments & Refunds',
    a: 'In rare UPI network drops, the payment may debit before our server confirms the webhook. Your bank typically releases the hold within 2-4 hours. To verify instantly, send your 12-digit UPI UTR number to our Admin via WhatsApp on +91 9491008797.',
  },
  {
    q: 'Can I cancel an order after placing it online?',
    category: 'Orders & Pickup',
    a: 'To guarantee fast service, kitchen preparation begins shortly after order placement. If your order status is still "Pending", call the Canteen Manager immediately (+91 9603649488) to stop preparation. Once status changes to "Preparing", orders cannot be canceled.',
  },
  {
    q: 'What are the canteen operational hours and meal slots?',
    category: 'Timings & Campus',
    a: 'The canteen operates Monday through Saturday:\n• Breakfast: 7:30 AM – 10:30 AM\n• Lunch: 12:00 PM – 3:00 PM\n• Snacks & Beverages: 4:30 PM – 7:00 PM\n• Dinner: 7:30 PM – 10:00 PM\nSunday services may have adjusted schedules posted in Announcements.',
  },
  {
    q: 'What payment modes are accepted on the website?',
    category: 'Payments & Refunds',
    a: 'We accept all major UPI apps (Google Pay, PhonePe, Paytm, BHIM, Cred), Net Banking, RuPay/Visa/Mastercard debit cards, and Cash on Counter. Online payments generate an instant verified digital token.',
  },
  {
    q: 'Where is the canteen located on campus?',
    category: 'Timings & Campus',
    a: 'Aparna Devi Canteen is situated at the Central Campus Food Court, Ground Floor, right adjacent to the Main Academic Quadrangle.',
  },
];

const FAQ_CATEGORIES = ['All', 'Orders & Pickup', 'Payments & Refunds', 'Timings & Campus'];

const Support = () => {
  const [selectedIssueId, setSelectedIssueId] = useState('payment');
  const [copiedNumber, setCopiedNumber] = useState(null);
  const [faqCategory, setFaqCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  // Determine current canteen status
  const canteenStatus = useMemo(() => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const totalMinutes = hours * 60 + minutes;

    // Slots in minutes
    const slots = [
      { name: 'Breakfast', start: 7 * 60 + 30, end: 10 * 60 + 30 },
      { name: 'Lunch', start: 12 * 60, end: 15 * 60 },
      { name: 'Evening Snacks', start: 16 * 60 + 30, end: 19 * 60 },
      { name: 'Dinner', start: 19 * 60 + 30, end: 22 * 60 },
    ];

    const currentSlot = slots.find((s) => totalMinutes >= s.start && totalMinutes <= s.end);
    if (currentSlot) {
      return { isOpen: true, text: `Open Now (${currentSlot.name})`, subtext: 'Serving freshly prepared food' };
    }

    // Find next opening slot
    const nextSlot = slots.find((s) => totalMinutes < s.start) || slots[0];
    const startHour = Math.floor(nextSlot.start / 60);
    const startMin = nextSlot.start % 60;
    const formattedTime = `${startHour > 12 ? startHour - 12 : startHour}:${startMin === 0 ? '00' : startMin} ${startHour >= 12 ? 'PM' : 'AM'}`;

    return { isOpen: false, text: 'Closed Right Now', subtext: `Next slot opens at ${formattedTime} (${nextSlot.name})` };
  }, []);

  const selectedIssue = useMemo(() => {
    return ISSUE_TYPES.find((i) => i.id === selectedIssueId) || ISSUE_TYPES[0];
  }, [selectedIssueId]);

  const handleCopy = (num) => {
    if (!navigator?.clipboard) return;
    navigator.clipboard.writeText(num);
    setCopiedNumber(num);
    setTimeout(() => setCopiedNumber(null), 2000);
  };

  const filteredFaqs = useMemo(() => {
    return FAQS.filter((faq) => {
      const matchesCategory = faqCategory === 'All' || faq.category === faqCategory;
      const matchesQuery =
        searchQuery.trim() === '' ||
        faq.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.a.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesQuery;
    });
  }, [faqCategory, searchQuery]);

  return (
    <div className="support-hub-page">
      <PageHeader
        title="Help & Support"
        subtitle="We are here to help you with your canteen orders, payments, and campus pickup."
      />

      {/* Real-time Status and Location Bar */}
      <motion.div
        className="support-status-bar"
        initial={fadeUp.initial}
        animate={fadeUp.animate}
        transition={{ duration: 0.3 }}
      >
        <div className="support-status-left">
          <div className={`support-status-pill ${canteenStatus.isOpen ? 'open' : 'closed'}`}>
            <span className="support-status-dot" />
            <span className="support-status-pill-text">{canteenStatus.text}</span>
          </div>
          <p className="support-status-desc">{canteenStatus.subtext}</p>
        </div>

        <div className="support-location-info">
          <div className="support-location-item">
            <Clock size={16} className="support-info-icon" />
            <span>Regular Hours: 7:30 AM – 10:00 PM</span>
          </div>
          <div className="support-location-item">
            <MapPin size={16} className="support-info-icon" />
            <span>Campus Food Court, Counter 1 & 2</span>
          </div>
        </div>
      </motion.div>

      {/* Main 3-Column Contact Channels Grid */}
      <section className="support-channels-section" aria-label="Direct Support Contacts">
        <h2 className="support-section-heading">Direct Contact Channels</h2>
        <div className="support-channels-grid">
          {SUPPORT_CONTACTS.map((contact, idx) => {
            const Icon = contact.icon;
            const isCopied = copiedNumber === contact.phone;

            return (
              <motion.div
                key={contact.id}
                className="support-channel-card"
                initial={fadeUp.initial}
                animate={fadeUp.animate}
                transition={{ delay: idx * 0.08, duration: 0.3 }}
              >
                <div className="support-channel-header">
                  <div className="support-channel-icon-wrap">
                    <Icon size={20} className="support-channel-icon" />
                  </div>
                  <span className="support-channel-badge">{contact.badge}</span>
                </div>

                <h3 className="support-channel-title">{contact.role}</h3>
                <div className="support-channel-hours">
                  <Clock size={14} />
                  <span>{contact.hours}</span>
                </div>
                <p className="support-channel-desc">{contact.description}</p>

                <div className="support-channel-phone-row">
                  <span className="support-channel-number">+91 {contact.phone}</span>
                  <button
                    type="button"
                    className="support-copy-btn"
                    onClick={() => handleCopy(contact.phone)}
                    title="Copy phone number"
                    aria-label={`Copy +91 ${contact.phone}`}
                  >
                    {isCopied ? <Check size={14} className="copied" /> : <Copy size={14} />}
                    <span>{isCopied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>

                <div className="support-channel-actions">
                  {contact.options.includes('call') && (
                    <a
                      href={`tel:+91${contact.phone}`}
                      className="support-action-btn support-action-call"
                      title={`Call +91 ${contact.phone}`}
                    >
                      <Phone size={16} />
                      <span>Call Now</span>
                    </a>
                  )}
                  {contact.options.includes('whatsapp') && (
                    <a
                      href={`https://wa.me/91${contact.phone}?text=${encodeURIComponent(contact.whatsappMsg)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="support-action-btn support-action-whatsapp"
                      title={`WhatsApp +91 ${contact.phone}`}
                    >
                      <MessageCircle size={16} />
                      <span>WhatsApp</span>
                    </a>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Quick Issue & Escalation Helper */}
      <section className="support-issue-helper-section" aria-label="Issue Resolution Helper">
        <div className="support-issue-helper-card">
          <div className="support-issue-helper-header">
            <div className="support-issue-title-wrap">
              <div className="support-issue-icon-wrap">
                <HelpCircle size={22} />
              </div>
              <div>
                <h2 className="support-issue-main-title">Quick Issue Resolution Helper</h2>
                <p className="support-issue-subtitle">
                  Select your common concern below for instant guidance and one-tap escalation.
                </p>
              </div>
            </div>
          </div>

          <div className="support-issue-selector-grid">
            {ISSUE_TYPES.map((issue) => {
              const IssueIcon = issue.icon;
              const isSelected = selectedIssueId === issue.id;

              return (
                <button
                  key={issue.id}
                  type="button"
                  className={`support-issue-tab ${isSelected ? 'active' : ''}`}
                  onClick={() => setSelectedIssueId(issue.id)}
                >
                  <IssueIcon size={17} className="support-issue-tab-icon" />
                  <span>{issue.label}</span>
                </button>
              );
            })}
          </div>

          {/* Selected Issue Details & Action Box */}
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedIssue.id}
              className="support-resolution-box"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <div className="support-resolution-content">
                <h4 className="support-resolution-heading">
                  <CheckCircle2 size={18} className="support-resolution-check-icon" />
                  Official Guidance
                </h4>
                <p className="support-resolution-text">{selectedIssue.resolution}</p>

                <div className="support-action-recommendation">
                  <span className="support-rec-label">Recommended Step:</span>
                  <p className="support-rec-text">{selectedIssue.suggestedAction}</p>
                </div>
              </div>

              <div className="support-resolution-cta">
                <a
                  href={`https://wa.me/91${selectedIssue.contactNumber}?text=${encodeURIComponent(
                    `Hi Support, I need help regarding: ${selectedIssue.label}. Could you please check?`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="support-escalate-btn"
                >
                  <MessageCircle size={17} />
                  <span>Escalate on WhatsApp</span>
                  <ArrowRight size={16} />
                </a>
                <span className="support-cta-note">Instant reply during operational hours</span>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* Searchable FAQ Accordion */}
      <section className="support-faq-section" aria-label="Frequently Asked Questions">
        <div className="support-faq-header">
          <div>
            <h2 className="support-section-heading">Frequently Asked Questions</h2>
            <p className="support-section-sub">Find quick answers to common queries about canteen services.</p>
          </div>

          {/* Search bar */}
          <div className="support-search-wrapper">
            <Search size={17} className="support-search-icon" />
            <input
              type="text"
              className="support-search-input"
              placeholder="Search questions (e.g. token, refund, pickup)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                className="support-search-clear"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search query"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Category Pills */}
        <div className="support-faq-category-pills">
          {FAQ_CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`support-faq-cat-btn ${faqCategory === cat ? 'active' : ''}`}
              onClick={() => setFaqCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* FAQ Accordion List */}
        <div className="support-faq-list">
          {filteredFaqs.length === 0 ? (
            <div className="support-faq-empty">
              <HelpCircle size={32} className="support-empty-icon" />
              <p>No matching questions found.</p>
              <button
                type="button"
                className="btn btn-secondary btn-sm mt-3"
                onClick={() => {
                  setSearchQuery('');
                  setFaqCategory('All');
                }}
              >
                Reset Search Filters
              </button>
            </div>
          ) : (
            filteredFaqs.map((faq, index) => {
              const isOpen = openFaqIndex === index;

              return (
                <div key={index} className={`support-faq-item ${isOpen ? 'open' : ''}`}>
                  <button
                    type="button"
                    className="support-faq-question-btn"
                    onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                    aria-expanded={isOpen}
                  >
                    <span className="support-faq-q-text">{faq.q}</span>
                    <span className="support-faq-category-tag">{faq.category}</span>
                    <motion.span
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="support-faq-chevron"
                    >
                      <ChevronDown size={18} />
                    </motion.span>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        className="support-faq-answer-wrap"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.22, ease: 'easeInOut' }}
                      >
                        <div className="support-faq-answer-inner">
                          {faq.a.split('\n').map((para, pIdx) => (
                            <p key={pIdx} className="support-faq-paragraph">
                              {para}
                            </p>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
};

export default Support;
