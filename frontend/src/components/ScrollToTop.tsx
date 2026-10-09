import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { scrollToElement, scrollToTop } from '../hooks/useLenis';
import { useSettings } from '../context/useSettings';

/**
 * Resets scroll to top on every route change via Lenis (not window.scrollTo).
 * Must be inside <BrowserRouter>.
 */
export default function ScrollToTop() {
  const { pathname, hash, key } = useLocation();
  const { isLoading } = useSettings();
  const previousPath = useRef<string | null>(null);

  useEffect(() => {
    if (pathname === '/' && hash && isLoading) return;
    const immediate = previousPath.current !== pathname || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    previousPath.current = pathname;
    let frame = 0;
    const hasSection = pathname === '/' && /^#(?:home|about|projects|skills|experience|contact)-section$/.test(hash);
    const scrollWhenReady = () => {
      const target = hasSection
        ? document.getElementById(hash.slice(1))
        : null;
      // The homepage may not have committed yet when arriving from another route.
      if (hasSection && !target) return;
      if (target) {
        // Earlier loading sections can change the target's position.
        const pending = [...document.querySelectorAll('[aria-busy="true"]')]
          .some(element => element === target || Boolean(element.compareDocumentPosition(target) & Node.DOCUMENT_POSITION_FOLLOWING));
        if (pending) return;
      }
      observer.disconnect();
      frame = requestAnimationFrame(() => {
        if (target) scrollToElement(target, -64, immediate);
        else scrollToTop();
      });
    };
    const observer = new MutationObserver(scrollWhenReady);
    observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['aria-busy'] });
    scrollWhenReady();
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [pathname, hash, key, isLoading]);

  return null;
}
