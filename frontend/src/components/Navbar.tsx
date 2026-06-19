import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMenu, FiX } from 'react-icons/fi';
import { scrollToElement } from '../hooks/useLenis';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/projects', label: 'Projects' },
  { to: '/skills', label: 'Skills' },
  { to: '/experience', label: 'Education & Certifications' },
  { to: '/blog', label: 'Blog' },
  { to: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Scroll shadow
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMenuOpen(false);
    setActiveSection(null);
  }, [location]);

  // IntersectionObserver: on home route, track home/about sections
  useEffect(() => {
    if (location.pathname !== '/') return;

    const homeEl = document.getElementById('home-section');
    const aboutEl = document.getElementById('about-section');
    if (!homeEl || !aboutEl) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Pick the one most visible
        let best: IntersectionObserverEntry | null = null;
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (!best || entry.intersectionRatio > best.intersectionRatio) {
              best = entry;
            }
          }
        });
        if (best) setActiveSection((best as IntersectionObserverEntry).target.id);
      },
      { threshold: [0.1, 0.3, 0.5] }
    );

    observer.observe(homeEl);
    observer.observe(aboutEl);
    return () => observer.disconnect();
  }, [location.pathname]);

  // Smart click: on home page About → smooth scroll; Home → scroll top; others → navigate
  const handleNavClick = (to: string) => {
    setMenuOpen(false);

    if (location.pathname === '/') {
      if (to === '/about') {
        const el = document.getElementById('about-section');
        if (el) { scrollToElement(el); setActiveSection('about-section'); }
        return;
      }
      if (to === '/') {
        const el = document.getElementById('home-section');
        if (el) { scrollToElement(el, 0); setActiveSection('home-section'); }
        return;
      }
    }

    navigate(to);
  };

  const isTabActive = (to: string) => {
    if (location.pathname === '/') {
      if (to === '/about') return activeSection === 'about-section';
      if (to === '/') return activeSection === 'home-section' || activeSection === null;
      return false;
    }
    if (to === '/') return location.pathname === '/';
    return location.pathname.startsWith(to);
  };

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'backdrop-blur-xl bg-[#FAF4EF]/85 border-b' : 'bg-transparent'
      }`}
      style={{
        borderBottomColor: scrolled ? 'rgba(212, 175, 55, 0.2)' : 'transparent',
      }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between overflow-hidden">
        {/* Logo */}
        <button
          onClick={() => handleNavClick('/')}
          className="flex items-center gap-1 group cursor-pointer bg-transparent border-0 p-0"
        >
          <img
            src="/logo.png"
            alt="Logo"
            className="h-17 w-17 object-contain bg-white p-0.5 shadow-sm rounded-full transition-opacity group-hover:opacity-90"
          />
          <span
            className="font-medium text-base sm:text-lg tracking-tight underline underline-offset-4 decoration-1 truncate max-w-[140px] sm:max-w-none"
            style={{
              fontFamily: "'Playfair Display', serif",
              color: 'var(--text-primary)',
            }}
          >
            Thimira Pathum
          </span>
        </button>

        {/* Desktop links with sliding indicator */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map(({ to, label }) => {
            const isActive = isTabActive(to);
            return (
              <button
                key={to}
                onClick={() => handleNavClick(to)}
                className="relative px-4 py-2 text-sm font-medium cursor-pointer bg-transparent border-0 transition-colors duration-200"
                style={{
                  color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
                  fontWeight: isActive ? 600 : 400,
                }}
              >
                {label}

                {/* Sliding animated underline — single shared element across all tabs */}
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full"
                    style={{
                      background: 'linear-gradient(90deg, var(--accent-secondary), var(--accent-primary))',
                    }}
                    transition={{
                      type: 'spring',
                      stiffness: 380,
                      damping: 30,
                    }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Mobile toggle */}
        <div className="flex items-center gap-3 md:hidden">
          <button
            className="p-2 transition-colors"
            style={{ color: 'var(--text-secondary)' }}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden backdrop-blur-xl"
            style={{
              backgroundColor: 'rgba(250, 244, 239, 0.97)',
              borderBottom: '1px solid rgba(212, 175, 55, 0.2)',
            }}
          >
            <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col gap-1">
              {navLinks.map(({ to, label }) => {
                const isActive = isTabActive(to);
                return (
                  <button
                    key={to}
                    onClick={() => handleNavClick(to)}
                    className="px-4 py-3 rounded-lg text-sm font-medium transition-all text-left cursor-pointer bg-transparent border-0"
                    style={{
                      color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
                      backgroundColor: isActive ? 'rgba(232, 116, 29, 0.08)' : 'transparent',
                      fontWeight: isActive ? 600 : 400,
                    }}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
