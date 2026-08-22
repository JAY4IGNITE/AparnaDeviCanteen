import { Phone, MessageCircle } from 'lucide-react';
import { motion } from 'motion/react';
import PageHeader from '../../components/ui/PageHeader';
import { fadeUp } from '../../lib/motion';

const Support = () => {
  const contacts = [
    {
      title: 'Canteen Owner',
      name: 'Owner',
      number: '9603649488',
      options: ['call', 'whatsapp']
    },
    {
      title: 'Admin',
      name: 'Admin',
      number: '9491008797',
      options: ['whatsapp']
    },
    {
      title: 'Supporting Team',
      name: 'Supporting Team',
      number: '9989092333',
      options: ['call', 'whatsapp']
    }
  ];

  return (
    <div>
      <PageHeader title="Help & Support" subtitle="Contact us for any issues or queries" />

      <div className="support-grid">
        {contacts.map((contact, idx) => (
          <motion.div
            key={idx}
            className="card-static support-card"
            initial={fadeUp.initial}
            animate={fadeUp.animate}
            transition={{ delay: idx * 0.08 }}
            whileHover={{ y: -2, borderColor: 'rgba(249, 115, 22, 0.25)' }}
          >
            <h3 className="support-card-title">{contact.title}</h3>
            <p className="support-card-desc">
              Reach out to the {contact.name.toLowerCase()} directly via {contact.options.includes('call') ? 'phone call or WhatsApp' : 'WhatsApp'}.
            </p>

            <div className="support-actions">
              {contact.options.includes('call') && (
                <a
                  href={`tel:+91${contact.number}`}
                  className="btn btn-primary"
                >
                  <Phone size={18} /> Call +91 {contact.number}
                </a>
              )}
              {contact.options.includes('whatsapp') && (
                <a
                  href={`https://wa.me/91${contact.number}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary btn-whatsapp"
                >
                  <MessageCircle size={18} /> WhatsApp
                </a>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Support;
