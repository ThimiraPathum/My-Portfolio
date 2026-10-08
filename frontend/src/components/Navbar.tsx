import Brand from './Brand';
import { useSettings } from '../context/useSettings';
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMenu, FiX } from 'react-icons/fi';

interface NavItem {
  key: string;
  label: string;
  sectionId?: string;
  route?: string;
}

const navItems: NavItem[] = [
  { key: 'home', label: 'Home', sectionId: 'home-section' },
  { key: 'about', label: 'About', sectionId: 'about-section' },
  { key: 'projects', label: 'Projects', sectionId: 'projects-section' },
  { key: 'skills', label: 'Skills', sectionId: 'skills-section' },
  { key: 'experience', label: 'Education & Certifications', sectionId: 'experience-section' },
  { key: 'blog', label: 'Blog', route: '/blog' },
  { key: 'contact', label: 'Contact', sectionId: 'contact-section' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuLocation, setMenuLocation] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<string>('home-section');
  const location = useLocation();
  const { settings, isLoading } = useSettings();
  const navigate = useNavigate();
  const menuOpen = menuLocation === location.key;
  const setMenuOpen = (open: boolean) => setMenuLocation(open ? location.key : null);

  // Scroll glass-morphism toggle
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  // Attach after the settings-dependent homepage has mounted.
  useEffect(() => {
    if (location.pathname !== '/' || isLoading) return;
    const elements = navItems.flatMap(item => {
      const element = item.sectionId && document.getElementById(item.sectionId);
      return element ? [element] : [];
    });
    const updateActive = () => {
      const current = elements.filter(element => element.getBoundingClientRect().top <= 160).at(-1);
      setActiveSection(current?.id ?? 'home-section');
    };
    const frame = requestAnimationFrame(updateActive);
    window.addEventListener('scroll', updateActive, { passive: true });
    window.addEventListener('resize', updateActive);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', updateActive);
      window.removeEventListener('resize', updateActive);
    };
  }, [location.pathname, isLoading]);

  // Smart Nav Click Handler: smooth scroll on SPA landing, navigate to '/' then scroll from other routes, navigate to '/blog' for Blog link
  const handleNavClick = (item: NavItem) => {
    setMenuOpen(false);

    // Dedicated separate route (Blog page)
    if (item.route) {
      navigate(item.route);
      return;
    }

    if (item.sectionId) {
      navigate({ pathname: '/', hash: `#${item.sectionId}` });
    }
  };

  const isItemActive = (item: NavItem) => {
    if (item.route) {
      return location.pathname.startsWith(item.route);
    }
    if (location.pathname === '/' && item.sectionId) {
      return activeSection === item.sectionId;
    }
    return false;
  };

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'backdrop-blur-xl bg-[#FAF4EF]/85 border-b border-[rgba(212,175,55,0.2)] shadow-warm-sm' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between overflow-hidden">
        {/* Brand Logo */}
        <button
          onClick={() => handleNavClick(navItems[0])}
          className="flex min-w-0 items-center cursor-pointer rounded-xl bg-transparent border-0 p-0 mr-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-orange-700"
        >
          <Brand name={settings.home_name || 'Thimira Pathum'} />
        </button>

        {/* Desktop Sticky Nav Links */}
        <div className="hidden xl:flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = isItemActive(item);
            return (
              <button
                key={item.key}
                onClick={() => handleNavClick(item)}
                className="relative px-3.5 py-2 text-sm font-medium cursor-pointer bg-transparent border-0 transition-colors duration-200"
                style={{
                  color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
                  fontWeight: isActive ? 600 : 400,
                }}
              >
                {item.label}

                {/* Sliding Animated Indicator */}
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

        {/* Mobile Hamburger Toggle */}
        <div className="flex items-center gap-3 xl:hidden">
          <button
            className="p-2 transition-colors cursor-pointer"
            style={{ color: 'var(--text-secondary)' }}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
          >
            {menuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            id="mobile-navigation"
            className="xl:hidden backdrop-blur-xl border-b border-[rgba(212,175,55,0.2)]"
            style={{
              backgroundColor: 'rgba(250, 244, 239, 0.97)',
            }}
          >
            <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-1">
              {navItems.map((item) => {
                const isActive = isItemActive(item);
                return (
                  <button
                    key={item.key}
                    onClick={() => handleNavClick(item)}
                    className="px-4 py-3 rounded-lg text-sm font-medium transition-all text-left cursor-pointer bg-transparent border-0"
                    style={{
                      color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
                      backgroundColor: isActive ? 'rgba(232, 116, 29, 0.08)' : 'transparent',
                      fontWeight: isActive ? 600 : 400,
                    }}
                  >
                    {item.label}
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
