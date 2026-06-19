import { useRef } from 'react';
import { motion } from 'framer-motion';
import { FiArrowRight, FiGithub, FiLinkedin, FiMail } from 'react-icons/fi';
import { NavLink } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';
import { getSafeUrl } from '../api';
import About from './About';
import { scrollToElement } from '../hooks/useLenis';

export default function Home() {
  const { settings, isLoading } = useSettings();
  const aboutRef = useRef<HTMLDivElement>(null);

  const name = settings.home_name || 'Thimira Pathum';
  const [firstName, ...rest] = name.split(' ');
  const lastName = rest.join(' ');
  const description = settings.home_description || 'Building modern digital solutions through software engineering, networking, and innovation. Passionate about systems that are purposeful, efficient, and future-ready.';

  const handleScrollToAbout = () => {
    if (aboutRef.current) scrollToElement(aboutRef.current);
  };

  if (isLoading) return null;

  return (
    <div className="relative">
      {/* ── Hero Section ── */}
      <main
        id="home-section"
        className="min-h-screen flex flex-col items-center justify-start sm:justify-center pt-32 sm:pt-0 relative px-4 sm:px-6 grid-bg"
      >
        {/* Background blobs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl pointer-events-none" style={{ background: 'rgba(212, 175, 55, 0.04)' }} />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl pointer-events-none" style={{ background: 'rgba(232, 116, 29, 0.03)' }} />

        <div className="max-w-6xl w-full relative z-10 flex flex-col-reverse md:flex-row items-center justify-between gap-8 md:gap-12">
          {/* Text content — left side */}
          <div className="flex-1 w-full flex flex-col items-center md:items-start text-center md:text-left">
            <motion.div
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mono text-xs mb-4 tracking-widest flex items-center gap-2"
              style={{ color: 'var(--accent-primary)' }}
            >
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: 'var(--success)' }} />
              {'>'} hello.world()
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}>
              <h1
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight tracking-tight"
                style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}
              >
                <span
                  style={{
                    background: 'linear-gradient(135deg, #1a0a00 0%, #D4AF37 35%, #E8741D 65%, #0d0500 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  {firstName}
                </span>{' '}
                <span
                  style={{
                    background: 'linear-gradient(135deg, #E8741D 0%, #D4AF37 50%, #1a0800 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  {lastName}
                </span>
              </h1>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-base md:text-lg max-w-xl mb-8 leading-relaxed"
              style={{ color: 'var(--text-secondary)', lineHeight: '1.8' }}
            >
              {description}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row flex-wrap justify-center md:justify-start gap-4 mb-8 w-full sm:w-auto"
            >
              <NavLink
                to="/projects"
                className="w-full sm:w-auto text-center justify-center btn-gradient px-8 py-3.5 rounded-lg flex items-center gap-2 text-sm font-semibold"
              >
                Explore Projects <FiArrowRight />
              </NavLink>
              <button
                className="w-full sm:w-auto text-center px-8 py-3.5 rounded-lg text-sm font-semibold transition-all"
                style={{ border: '1px solid var(--accent-primary)', color: 'var(--accent-primary)' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(232, 116, 29, 0.08)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                onClick={handleScrollToAbout}
              >
                More About Me
              </button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex justify-center md:justify-start items-center gap-5"
            >
              {settings.social_github && (
                <a
                  href={settings.social_github}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 text-sm transition-colors"
                  style={{ color: 'var(--text-secondary)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--accent-primary)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-secondary)'; }}
                >
                  <FiGithub size={18} /> <span className="mono text-xs">GitHub</span>
                </a>
              )}
              {settings.social_linkedin && (
                <a
                  href={settings.social_linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 text-sm transition-colors"
                  style={{ color: 'var(--text-secondary)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--accent-primary)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-secondary)'; }}
                >
                  <FiLinkedin size={18} /> <span className="mono text-xs">LinkedIn</span>
                </a>
              )}
              {settings.social_email && (
                <a
                  href={`mailto:${settings.social_email}`}
                  className="flex items-center gap-1.5 text-sm transition-colors"
                  style={{ color: 'var(--text-secondary)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--accent-primary)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-secondary)'; }}
                >
                  <FiMail size={18} /> <span className="mono text-xs">Email</span>
                </a>
              )}
            </motion.div>
          </div>

          {/* Profile image — right side */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="flex-shrink-0 relative mb-8 md:mb-0 subtle-float"
          >
            <div
              className="hidden lg:block absolute -left-12 top-1/2 -translate-y-1/2 w-[2px] h-32 rounded-full"
              style={{ background: 'linear-gradient(180deg, var(--accent-secondary), var(--accent-primary), transparent)' }}
            />
            <div className="w-56 h-56 sm:w-72 sm:h-72 md:w-80 md:h-80 lg:w-96 lg:h-96 relative">
              <img
                src={settings.profile_photo ? getSafeUrl(settings.profile_photo) : '/profile.jpg'}
                alt={name}
                className="w-full h-full object-cover object-top relative z-10"
                style={{
                  borderRadius: '50%',
                  border: '3px solid var(--accent-secondary)',
                  boxShadow: '0 0 0 6px rgba(212, 175, 55, 0.1), 0 12px 36px rgba(232, 116, 29, 0.2)',
                }}
              />
            </div>
          </motion.div>
        </div>
      </main>

      {/* ── About Section (inline below hero) ── */}
      <div ref={aboutRef} id="about-section">
        <About />
      </div>
    </div>
  );
}
