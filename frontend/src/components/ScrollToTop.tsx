import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { scrollToTop } from '../hooks/useLenis';

/**
 * Resets scroll to top on every route change via Lenis (not window.scrollTo).
 * Must be inside <BrowserRouter>.
 */
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Use Lenis's immediate scroll reset so it overrides Lenis's internal position
    scrollToTop();
  }, [pathname]);

  return null;
}
