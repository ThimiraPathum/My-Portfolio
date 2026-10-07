import { useRef } from 'react';
import { motion } from 'framer-motion';
import { FiArrowRight, FiGithub, FiLinkedin, FiMail } from 'react-icons/fi';
import { useSettings } from '../context/useSettings';
import { getSafeUrl } from '../api';
import About from './About';
import Projects from './Projects';
import Skills from './Skills';
import Experience from './Experience';
import Contact from './Contact';
import RecentBlogs from '../components/RecentBlogs';
import { scrollToElement } from '../hooks/useLenis';
import MarkdownRenderer from "../components/MarkdownRenderer";

export default function Home() {
  const { settings, isLoading } = useSettings();
  const aboutRef = useRef<HTMLDivElement>(null);

  const name = settings.home_name || 'Thimira Pathum';
  const [firstName, ...rest] = name.split(' ');
  const lastName = rest.join(' ');
  const description = settings.home_description ?? 'Building modern digital solutions through software engineering, networking, and innovation. Passionate about systems that are purposeful, efficient, and future-ready.';

  const handleScrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) scrollToElement(el);
  };

  if (isLoading) return null;

  return (
    <div className="relative">
      {/* ── 1. Hero Section (#home-section) ── */}
      <main
        id="home-section"
        className="min-h-screen flex flex-col justify-center relative px-5 sm:px-6 grid-bg overflow-x-hidden"
        style={{ paddingTop: '64px' }}
      >
        {/* Background blobs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl pointer-events-none" style={{ background: 'rgba(212, 175, 55, 0.04)' }} />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl pointer-events-none" style={{ background: 'rgba(232, 116, 29, 0.03)' }} />

        <div className="max-w-7xl w-full mx-auto relative z-10">

          {/* ── MOBILE LAYOUT (hidden on md+) ── */}
          <div className="md:hidden flex flex-col items-center text-center">
            {/* Top: photo + name stacked */}
            <div className="flex flex-col items-center gap-5 mb-8">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                className="flex-shrink-0"
              >
                <div className="w-44 h-44 sm:w-52 sm:h-52">
                  <img
                    src={settings.profile_photo ? getSafeUrl(settings.profile_photo) : '/profile.jpg'}
                    alt={name}
                    className="w-full h-full object-cover object-top rounded-full"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = '/profile.jpg';
                    }}
                  />
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="flex flex-col items-center">
                <h1
                  className="text-5xl font-medium leading-tight mb-2"
                  style={{ fontFamily: "'Playfair Display', serif", letterSpacing: '-0.02em' }}
                >
                  <span style={{ color: 'var(--text-primary)' }}>{firstName}</span>
                  <br />
                  <span
                    style={{
                      fontStyle: 'italic',
                      background: 'linear-gradient(to right, #C1634D 0%, #7C8A54 33%, #4682B4 66%, #B8A058 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                      paddingRight: '0.15em',
                    }}
                  >
                    {lastName}
                  </span>
                </h1>
              </motion.div>
            </div>

            {/* Description */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="w-full text-sm mb-8 leading-relaxed px-2"
              style={{ color: 'var(--text-secondary)', lineHeight: '1.75' }}
            >
              <MarkdownRenderer content={description} />
            </motion.div>

            {/* Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row justify-center gap-3 mb-8 w-full px-2"
            >
              <button
                onClick={() => handleScrollToSection('projects-section')}
                className="text-center justify-center btn-gradient px-6 py-3.5 rounded-xl flex items-center gap-2 text-sm font-semibold w-full sm:w-auto cursor-pointer"
              >
                Explore Projects <FiArrowRight size={14} />
              </button>
              <button
                className="text-center px-6 py-3.5 rounded-xl text-sm font-semibold transition-all w-full sm:w-auto cursor-pointer"
                style={{ border: '1px solid var(--accent-primary)', color: 'var(--accent-primary)' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(232, 116, 29, 0.07)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                onClick={() => handleScrollToSection('about-section')}
              >
                More About Me
              </button>
            </motion.div>

            {/* Socials */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.45 }}
              className="flex items-center justify-center gap-3"
            >
              {settings.social_github && (
                <a href={settings.social_github} target="_blank" rel="noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all"
                  style={{ 
                    color: 'var(--text-secondary)',
                    border: '1px solid var(--border)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--accent-primary)';
                    e.currentTarget.style.color = 'var(--accent-primary)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border)';
                    e.currentTarget.style.color = 'var(--text-secondary)';
                  }}
                >
                  <FiGithub size={15} /> <span>GitHub</span>
                </a>
              )}
              {settings.social_linkedin && (
                <a href={settings.social_linkedin} target="_blank" rel="noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all"
                  style={{ 
                    color: 'var(--text-secondary)',
                    border: '1px solid var(--border)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--accent-primary)';
                    e.currentTarget.style.color = 'var(--accent-primary)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border)';
                    e.currentTarget.style.color = 'var(--text-secondary)';
                  }}
                >
                  <FiLinkedin size={15} /> <span>LinkedIn</span>
                </a>
              )}
              {settings.social_email && (
                <a href={`mailto:${settings.social_email}`}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all"
                  style={{ 
                    color: 'var(--text-secondary)',
                    border: '1px solid var(--border)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--accent-primary)';
                    e.currentTarget.style.color = 'var(--accent-primary)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border)';
                    e.currentTarget.style.color = 'var(--text-secondary)';
                  }}
                >
                  <FiMail size={15} /> <span>Email</span>
                </a>
              )}
            </motion.div>
          </div>

          {/* ── DESKTOP LAYOUT (hidden on mobile) ── */}
          <div className="hidden md:flex items-center justify-between gap-12">
            <div className="flex-1 flex flex-col items-start text-left">
              <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}>
                <h1
                  className="text-6xl lg:text-[5.5rem] font-medium mb-6 leading-none tracking-tight"
                  style={{ fontFamily: "'Playfair Display', serif", letterSpacing: '-0.02em' }}
                >
                  <span style={{ color: 'var(--text-primary)' }}>{firstName}</span>
                  <br />
                  <span
                    style={{
                      fontStyle: 'italic',
                      background: 'linear-gradient(to right, #C1634D 0%, #7C8A54 33%, #4682B4 66%, #B8A058 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                      paddingRight: '0.15em',
                    }}
                  >
                    {lastName}
                  </span>
                </h1>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
                className="w-full text-lg max-w-xl mb-8 leading-relaxed"
                style={{ color: 'var(--text-secondary)', lineHeight: '1.8' }}
              >
                <MarkdownRenderer content={description} />
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}
                className="flex flex-row flex-wrap gap-4 mb-8"
              >
                <button 
                  onClick={() => handleScrollToSection('projects-section')}
                  className="btn-gradient px-8 py-3.5 rounded-lg flex items-center gap-2 text-sm font-semibold cursor-pointer"
                >
                  Explore Projects <FiArrowRight />
                </button>
                <button
                  className="px-8 py-3.5 rounded-lg text-sm font-semibold transition-all cursor-pointer"
                  style={{ border: '1px solid var(--accent-primary)', color: 'var(--accent-primary)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(232, 116, 29, 0.08)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                  onClick={() => handleScrollToSection('about-section')}
                >
                  More About Me
                </button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex items-center justify-start gap-3"
              >
                {settings.social_github && (
                  <a href={settings.social_github} target="_blank" rel="noreferrer"
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all"
                    style={{ 
                      color: 'var(--text-secondary)',
                      border: '1px solid var(--border)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'var(--accent-primary)';
                      e.currentTarget.style.color = 'var(--accent-primary)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border)';
                      e.currentTarget.style.color = 'var(--text-secondary)';
                    }}
                  >
                    <FiGithub size={15} /> <span>GitHub</span>
                  </a>
                )}
                {settings.social_linkedin && (
                  <a href={settings.social_linkedin} target="_blank" rel="noreferrer"
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all"
                    style={{ 
                      color: 'var(--text-secondary)',
                      border: '1px solid var(--border)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'var(--accent-primary)';
                      e.currentTarget.style.color = 'var(--accent-primary)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border)';
                      e.currentTarget.style.color = 'var(--text-secondary)';
                    }}
                  >
                    <FiLinkedin size={15} /> <span>LinkedIn</span>
                  </a>
                )}
                {settings.social_email && (
                  <a href={`mailto:${settings.social_email}`}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all"
                    style={{ 
                      color: 'var(--text-secondary)',
                      border: '1px solid var(--border)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'var(--accent-primary)';
                      e.currentTarget.style.color = 'var(--accent-primary)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border)';
                      e.currentTarget.style.color = 'var(--text-secondary)';
                    }}
                  >
                    <FiMail size={15} /> <span>Email</span>
                  </a>
                )}
              </motion.div>
            </div>

            {/* Profile photo */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="flex-shrink-0 relative subtle-float"
            >
              <div className="w-72 h-72 md:w-80 md:h-80 lg:w-96 lg:h-96">
                <img
                  src={settings.profile_photo ? getSafeUrl(settings.profile_photo) : '/profile.jpg'}
                  alt={name}
                  className="w-full h-full object-cover object-top rounded-full"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = '/profile.jpg';
                  }}
                />
              </div>
            </motion.div>
          </div>

        </div>
      </main>

      {/* ── 2. About Section (#about-section) ── */}
      <div ref={aboutRef}>
        <About />
      </div>

      {/* ── 3. Projects Section (#projects-section) ── */}
      <Projects limit={2} />

      {/* ── 4. Skills Section (#skills-section) ── */}
      <Skills />

      {/* ── 5. Education & Certifications (#experience-section) ── */}
      <Experience />

      {/* ── 6. Hybrid Blog Preview (#blog-preview-section) ── */}
      <RecentBlogs />

      {/* ── 7. Contact Section (#contact-section) ── */}
      <Contact />
    </div>
  );
}
