import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Automatically scrolls the window to the top on every route change.
 * Ensures consistent, professional page navigation in SPAs.
 */
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant'
    });
    if (document.documentElement) document.documentElement.scrollTop = 0;
    if (document.body) document.body.scrollTop = 0;
    const mainContainers = document.querySelectorAll('.main-content, .customer-layout-main, .app-layout');
    mainContainers.forEach(el => {
      if (el) el.scrollTop = 0;
    });
  }, [pathname]);

  return null;
}
