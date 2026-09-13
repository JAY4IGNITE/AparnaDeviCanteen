import { useState } from 'react';
import {
  Phone,
  MessageCircle,
  Clock,
  Copy,
  Check,
  ChefHat,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';

const SUPPORT_CONTACTS = [
  {
    id: 'manager',
    role: 'Canteen In-charge & Manager',
    badge: 'Management',
    name: 'Canteen Owner',
    phone: '9603649488',
    hours: 'During Active Canteen Hours',
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
    hours: 'During Active Canteen Hours',
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


const Support = () => {
  const [copiedNumber, setCopiedNumber] = useState(null);

  const handleCopy = (num) => {
    if (!navigator?.clipboard) return;
    navigator.clipboard.writeText(num);
    setCopiedNumber(num);
    setTimeout(() => setCopiedNumber(null), 2000);
  };

  return (
    <div className="support-hub-page">
      <PageHeader title="Help & Support" subtitle="Get in touch with our canteen team for any assistance." />

      {/* Direct Contact Channels */}
      <section className="support-channels-section" aria-label="Direct Support Contacts">
        <h2 className="support-section-heading">Direct Contact Channels</h2>
        <div className="support-channels-grid">
          {SUPPORT_CONTACTS.map((contact) => {
            const Icon = contact.icon;
            const isCopied = copiedNumber === contact.phone;

            return (
              <div
                key={contact.id}
                className="support-channel-card"
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
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default Support;
