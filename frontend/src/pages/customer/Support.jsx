import { Phone, MessageCircle } from 'lucide-react';
import { motion } from 'motion/react';
import PageHeader from '../../components/ui/PageHeader';
import { fadeUp } from '../../lib/motion';

const Support = () => {
  const contacts = [
    { title: 'Canteen Owner', number: '9603649488', name: 'Owner' },
    { title: 'Developer', number: '9989092333', name: 'Developer' }
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
              Reach out to the {contact.name.toLowerCase()} directly via phone call or WhatsApp.
            </p>

            <div className="support-actions">
              <a
                href={`tel:+91${contact.number}`}
                className="btn btn-primary"
              >
                <Phone size={18} /> Call +91 {contact.number}
              </a>
              <a
                href={`https://wa.me/91${contact.number}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary btn-whatsapp"
              >
                <MessageCircle size={18} /> WhatsApp
              </a>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Support;
