import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTimelineScroll } from '../hooks/useTimelineScroll';
import Hero from '../components/Common/Hero';
import About from './About';
import '../styles/timeline.css';

export default function TimelinePage() {
  const scrollProgress = useTimelineScroll();
  const location = useLocation();

  // Scroll to section based on route on mount and when path changes
  useEffect(() => {
    const path = location.pathname;
    let targetId = 'home';
    if (path === '/about') targetId = 'about';

    // Wait a short tick for content/API data to start rendering
    const timer = setTimeout(() => {
      const el = document.getElementById(targetId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [location.pathname]);

  // Track active section and dispatch custom event to Navbar
  useEffect(() => {
    const handleScroll = () => {
      const sectionIds = ['home', 'about'];

      // Middle-of-viewport offset for detection
      const scrollPosition = window.scrollY + window.innerHeight / 3;

      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            const path = id === 'home' ? '/' : `/${id}`;
            window.dispatchEvent(new CustomEvent('timelineActiveSection', { detail: path }));
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Run an initial check after a brief timeout to let DOM settle
    const timer = setTimeout(handleScroll, 200);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(timer);
    };
  }, []);

  return (
    <motion.div 
      className="min-h-screen relative timeline-pattern"
      style={{ backgroundColor: 'var(--bg-primary)' }}
    >
      {/* Home / Hero Section */}
      <div id="home">
        <Hero />
      </div>

      {/* About Section */}
      <div id="about">
        <About />
      </div>

      {/* Floating Back to Top Button */}
      <AnimatePresence>
        {scrollProgress > 0.15 && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-6 right-6 p-3 rounded-full border border-[var(--border)] bg-white/80 hover:bg-white text-[var(--accent-primary)] shadow-warm-sm z-30 transition-all cursor-pointer hover:scale-105"
          >
            &uarr;
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
