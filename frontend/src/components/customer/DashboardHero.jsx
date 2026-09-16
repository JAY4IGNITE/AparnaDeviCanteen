import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Search } from 'lucide-react';
import MotionButton from '../ui/MotionButton';

const DashboardHero = () => {
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState('');

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const query = searchInput.trim();
    if (query) {
      navigate(`/customer/menu?q=${encodeURIComponent(query)}`);
    } else {
      navigate('/customer/menu');
    }
  };

  return (
    <section className="dashboard-hero-section" aria-label="Hero banner">
      <div className="dashboard-hero-card">
        <div className="hero-content-col">
          <h2 className="hero-title">
            Hungry? <br />
            <span className="hero-title-highlight">Your favourite meals are waiting.</span>
          </h2>

          <p className="hero-description">
            Skip the counter wait. Explore today's freshly made specialties, biryanis, starters, and snacks.
          </p>

          <div className="hero-actions-wrap">
            <MotionButton
              type="button"
              className="hero-cta-btn"
              onClick={() => navigate('/customer/menu')}
              id="hero-explore-menu-btn"
              dockMagnification={1.06}
            >
              <span>Explore Menu</span>
              <ArrowRight size={18} />
            </MotionButton>

            {/* In-hero Quick Search */}
            <form onSubmit={handleSearchSubmit} className="hero-search-form">
              <Search size={17} className="hero-search-icon" />
              <input
                type="text"
                placeholder="Search biryani, dosa, juice..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="hero-search-input"
                aria-label="Search dishes directly from hero"
              />
              <MotionButton
                type="submit"
                className="hero-search-submit-btn"
                aria-label="Search"
                dockMagnification={1.08}
              >
                Search
              </MotionButton>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DashboardHero;
