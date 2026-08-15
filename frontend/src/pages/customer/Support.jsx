import { Phone, MessageCircle } from 'lucide-react';

const Support = () => {
  const contacts = [
    { title: 'Canteen Owner', number: '9603649488', name: 'Owner' },
    { title: 'Developer', number: '9989092333', name: 'Developer' }
  ];

  return (
    <div>
      <div className="page-header">
        <h1>Help & Support</h1>
        <p>Contact us for any issues or queries</p>
      </div>

      <div style={{ display: 'grid', gap: '1.5rem', maxWidth: '600px', marginTop: '2rem' }}>
        {contacts.map((contact, idx) => (
          <div className="card-static" key={idx} style={{ padding: '1.5rem' }}>
            <h3 style={{ marginBottom: '0.5rem', color: 'var(--primary-400)' }}>{contact.title}</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
              Reach out to the {contact.name.toLowerCase()} directly via phone call or WhatsApp.
            </p>

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <a 
                href={`tel:+91${contact.number}`} 
                className="btn btn-primary"
                style={{ flex: 1, display: 'flex', justifyContent: 'center' }}
              >
                <Phone size={18} /> Call +91 {contact.number}
              </a>
              <a 
                href={`https://wa.me/91${contact.number}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn btn-secondary"
                style={{ flex: 1, display: 'flex', justifyContent: 'center', borderColor: '#25D366', color: '#25D366' }}
              >
                <MessageCircle size={18} /> WhatsApp
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Support;
