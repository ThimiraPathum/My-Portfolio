import { useEffect } from 'react';
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

  useEffect(() => {
    if (pathname === '/' && hash && isLoading) return;
    let frame = 0;
    const scrollWhenReady = () => {
      const target = pathname === '/' && hash
        ? document.getElementById(hash.slice(1))
        : null;
      if (target) {
        // Earlier loading sections can change the target's position.
        const pending = [...document.querySelectorAll('[aria-busy="true"]')]
          .some(element => element === target || Boolean(element.compareDocumentPosition(target) & Node.DOCUMENT_POSITION_FOLLOWING));
        if (pending) return;
      }
      observer.disconnect();
      frame = requestAnimationFrame(() => {
        if (target) scrollToElement(target);
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
