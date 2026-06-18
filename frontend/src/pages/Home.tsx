import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiArrowRight, FiGithub, FiLinkedin, FiMail } from 'react-icons/fi';
import { NavLink } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';
import { getSafeUrl } from '../api';

export default function Home() {
  const { settings, isLoading } = useSettings();
  const [roleIndex, setRoleIndex] = useState(0);
  const [displayed, setDisplayed] = useState('');
  const [erasing, setErasing] = useState(false);

  // Fallbacks if settings not loaded yet
  const greeting = settings.home_greeting || 'Hello, I am';
  const name = settings.home_name || 'Thimira Pathum';
  const rolesText = settings.home_roles || 'Software Engineering,Web Development,Networking,System Design,ICT Undergraduate,DEV_OPS';
  const roles = rolesText.split(',').map((r) => r.trim());
  const tagline = settings.home_tag || 'Building beyond limits with code and creativity.';
  const description = settings.home_description || 'Building modern digital solutions through software engineering, networking, and innovation. Passionate about systems that are purposeful, efficient, and future-ready.';

  useEffect(() => {
    if (isLoading) return;
    const current = roles[roleIndex] || '';
    let timeout: ReturnType<typeof setTimeout>;

    if (!erasing && displayed.length < current.length) {
      timeout = setTimeout(() => setDisplayed(current.slice(0, displayed.length + 1)), 70);
    } else if (!erasing && displayed.length === current.length) {
      timeout = setTimeout(() => setErasing(true), 2200);
    } else if (erasing && displayed.length > 0) {
      timeout = setTimeout(() => setDisplayed(displayed.slice(0, -1)), 35);
    } else if (erasing && displayed.length === 0) {
      setErasing(false);
      setRoleIndex((i) => (i + 1) % roles.length);
    }
    return () => clearTimeout(timeout);
  }, [displayed, erasing, roleIndex, roles, isLoading]);

  if (isLoading) return null; // Avoid flicker

  return (
    <main className="min-h-screen flex flex-col items-center justify-start sm:justify-center pt-32 sm:pt-0 relative px-4 sm:px-6 grid-bg">
      {/* Background blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-blue-500/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-cyan-400/5 blur-3xl pointer-events-none" />

      <div className="max-w-6xl w-full relative z-10 flex flex-col-reverse md:flex-row items-center justify-between gap-8 md:gap-12">
        <div className="flex-1 w-full flex flex-col items-center md:items-start text-center md:text-left">
          <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mono text-xs text-cyan-400 mb-6 tracking-widest flex items-center gap-2"
        >
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          {'>'} {greeting}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}>
          <h1 className="text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-extrabold mb-4 leading-tight sm:leading-none tracking-tight">
            <span className="text-white">{name.split(' ')[0]}</span>{' '}
            <span className="gradient-text">{name.split(' ').slice(1).join(' ')}</span>
          </h1>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg md:text-2xl text-gray-300 font-light mb-3 min-h-[1.5rem] sm:h-9">
          <span className="text-cyan-400/70 mono mr-2">{'>'}</span>
          <span className="typewriter">{displayed}</span>
        </motion.div>

        <motion.p initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.25 }}
          className="text-sm mono text-gray-500 mb-8 whitespace-pre-wrap">
          {roles.join('  |  ')}
        </motion.p>

        <motion.p initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}
          className="text-gray-400 text-base md:text-lg max-w-2xl mb-10 leading-relaxed whitespace-pre-wrap">
          {description}
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.35 }}
          className="mb-10">
          <span className="inline-block px-4 py-2 rounded-full border border-cyan-400/20 bg-cyan-400/5 text-cyan-400 text-sm mono">
            "{tagline}"
          </span>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-col sm:flex-row flex-wrap justify-center md:justify-start gap-4 mb-12">
          <NavLink to="/projects" className="w-full sm:w-auto text-center justify-center btn-gradient px-8 py-3.5 rounded-xl flex items-center gap-2 text-sm font-semibold">
            View Projects <FiArrowRight />
          </NavLink>
          <NavLink to="/about" className="w-full sm:w-auto text-center px-8 py-3.5 rounded-xl border border-white/10 text-gray-300 hover:border-cyan-400/30 hover:text-white text-sm font-semibold transition-all">
            About Me
          </NavLink>
          <NavLink to="/blog" className="w-full sm:w-auto text-center px-8 py-3.5 rounded-xl border border-white/10 text-gray-300 hover:border-cyan-400/30 hover:text-white text-sm font-semibold transition-all">
            Read Blog
          </NavLink>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="flex justify-center md:justify-start items-center gap-5">
          {settings.social_github && (
            <a href={settings.social_github} target="_blank" rel="noreferrer" className="text-gray-600 hover:text-cyan-400 transition-colors flex items-center gap-1.5 text-sm">
              <FiGithub size={18} /> <span className="mono text-xs">GitHub</span>
            </a>
          )}
          {settings.social_linkedin && (
            <a href={settings.social_linkedin} target="_blank" rel="noreferrer" className="text-gray-600 hover:text-cyan-400 transition-colors flex items-center gap-1.5 text-sm">
              <FiLinkedin size={18} /> <span className="mono text-xs">LinkedIn</span>
            </a>
          )}
          {settings.social_email && (
            <a href={`mailto:${settings.social_email}`} className="text-gray-600 hover:text-cyan-400 transition-colors flex items-center gap-1.5 text-sm">
              <FiMail size={18} /> <span className="mono text-xs">Email</span>
            </a>
          )}
        </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }} 
          animate={{ opacity: 1, scale: 1 }} 
          transition={{ duration: 0.7, delay: 0.2 }}
          className="w-48 h-48 sm:w-64 sm:h-64 md:w-80 md:h-80 lg:w-[380px] lg:h-[380px] flex-shrink-0 relative mb-8 md:mb-0"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-cyan-400 to-purple-500 rounded-full blur-3xl opacity-20 animate-pulse" />
          <div className="absolute inset-0 rounded-full border border-white/10 bg-white/5" />
          <img 
            src={settings.profile_photo ? getSafeUrl(settings.profile_photo) : "/profile.jpg"} 
            alt={name} 
            className="w-full h-full object-cover object-top rounded-full relative z-10 shadow-2xl p-2"
          />
        </motion.div>
      </div>
    </main>
  );
}
