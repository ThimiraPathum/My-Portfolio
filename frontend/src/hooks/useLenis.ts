import { useEffect } from 'react';
import Lenis from 'lenis';

let lenisInstance: Lenis | null = null;

export function useLenis() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Apple-like easeOutExpo
      smoothWheel: true,
    });

    lenisInstance = lenis;

    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }

    rafId = requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
      lenisInstance = null;
      cancelAnimationFrame(rafId);
    };
  }, []);
}

// Call this from anywhere to smooth-scroll to an element via Lenis
export function scrollToElement(el: HTMLElement, offset = -64, immediate = false) {
  if (lenisInstance) {
    lenisInstance.resize();
    lenisInstance.scrollTo(el, { offset, duration: 0.6, force: true, immediate });
  } else {
    const y = el.getBoundingClientRect().top + window.scrollY + offset;
    window.scrollTo({ top: y, behavior: immediate ? 'instant' : 'smooth' });
  }
}

// Instantly jump to top — bypasses Lenis animation (for route changes)
export function scrollToTop() {
  if (lenisInstance) {
    lenisInstance.scrollTo(0, { immediate: true });
  } else {
    window.scrollTo({ top: 0, left: 0 });
  }
}
