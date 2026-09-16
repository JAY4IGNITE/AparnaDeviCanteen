import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronRight, 
  Sparkles, 
  CookingPot, 
  Flame, 
  Soup, 
  UtensilsCrossed, 
  Salad, 
  Coffee, 
  Cookie, 
  Utensils 
} from 'lucide-react';
import MotionButton from '../ui/MotionButton';

// Category icon component mapper based on keywords
const getCategoryIconComponent = (categoryName = '') => {
  const name = categoryName.toLowerCase();
  if (name.includes('biryani')) return CookingPot;
  if (name.includes('starter') || name.includes('starer') || name.includes('snack')) return Flame;
  if (name.includes('rice') || name.includes('fried')) return Soup;
  if (name.includes('noodle')) return UtensilsCrossed;
  if (name.includes('paneer') || name.includes('veg')) return Salad;
  if (name.includes('chicken') || name.includes('meat')) return Flame;
  if (name.includes('drink') || name.includes('beverage') || name.includes('juice')) return Coffee;
  if (name.includes('dessert') || name.includes('sweet')) return Cookie;
  if (name.includes('meal') || name.includes('thali')) return Utensils;
  return UtensilsCrossed;
};

const CategoryScroller = ({ menuItems = [], loading = false }) => {
  const navigate = useNavigate();

  // Extract dynamic categories and counts from menuItems
  const categories = useMemo(() => {
    if (!menuItems || menuItems.length === 0) return [];

    const map = new Map();
    for (const item of menuItems) {
      const cat = (item.category || 'General').trim();
      map.set(cat, (map.get(cat) || 0) + 1);
    }

    return Array.from(map.entries())
      .map(([name, count]) => ({
        name,
        count,
        icon: getCategoryIconComponent(name)
      }))
      .sort((a, b) => {
        // Prioritize Biryani and Starters
        const isAStarter = a.name.toLowerCase().includes('biryani') || a.name.toLowerCase().includes('starter');
        const isBStarter = b.name.toLowerCase().includes('biryani') || b.name.toLowerCase().includes('starter');
        if (isAStarter && !isBStarter) return -1;
        if (!isAStarter && isBStarter) return 1;
        return a.name.localeCompare(b.name);
      });
  }, [menuItems]);

  if (loading) {
    return (
      <section className="dashboard-section" aria-label="Loading food categories">
        <div className="section-header-row">
          <div className="skeleton-line" style={{ width: 180, height: 24, borderRadius: 8 }} />
        </div>
        <div className="category-scroll-container">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="category-pill-skeleton" />
          ))}
        </div>
      </section>
    );
  }

  if (categories.length === 0) {
    return null;
  }

  return (
    <section className="dashboard-section category-section" aria-label="Food categories">
      <div className="section-header-row">
        <div>
          <h3 className="section-title">What are you craving?</h3>
          <p className="section-subtitle">Select a category to jump straight to delicious choices</p>
        </div>
        <MotionButton
          type="button"
          className="section-link-btn"
          onClick={() => navigate('/customer/menu')}
          aria-label="View all categories in menu"
          dockMagnification={1.08}
        >
          <span>All Menu</span>
          <ChevronRight size={16} />
        </MotionButton>
      </div>

      <div className="category-scroll-container" role="list" tabIndex={0} aria-label="Category list">
        {/* "All" Category Pill */}
        <MotionButton
          type="button"
          className="category-pill all-pill"
          onClick={() => navigate('/customer/menu')}
          whileTap={{ scale: 0.94 }}
          role="listitem"
        >
          <span className="category-pill-icon" aria-hidden="true">
            <Sparkles size={19} />
          </span>
          <div className="category-pill-text">
            <span className="category-pill-name">All Items</span>
            <span className="category-pill-count">{menuItems.length} dishes</span>
          </div>
        </MotionButton>

        {/* Dynamic Category Pills */}
        {categories.map((cat) => {
          const IconComponent = cat.icon;
          return (
            <MotionButton
              key={cat.name}
              type="button"
              className="category-pill"
              onClick={() => navigate(`/customer/menu?category=${encodeURIComponent(cat.name)}`)}
              whileTap={{ scale: 0.94 }}
              role="listitem"
              id={`dashboard-cat-${cat.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
            >
              <span className="category-pill-icon" aria-hidden="true">
                <IconComponent size={19} />
              </span>
              <div className="category-pill-text">
                <span className="category-pill-name">{cat.name}</span>
                <span className="category-pill-count">{cat.count} {cat.count === 1 ? 'dish' : 'dishes'}</span>
              </div>
            </MotionButton>
          );
        })}
      </div>
    </section>
  );
};

export default CategoryScroller;
