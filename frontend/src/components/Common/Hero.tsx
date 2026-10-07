import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useSettings } from '../../context/useSettings';
import MarkdownRenderer from "../../components/MarkdownRenderer";

export default function Hero() {
  const { settings, isLoading } = useSettings();
  const [roleIndex, setRoleIndex] = useState(0);
  const [displayed, setDisplayed] = useState('');
  const [erasing, setErasing] = useState(false);

  const name = settings.home_name || 'Thimira Pathum';
  const rolesText = settings.home_roles || 'DevOps, MLOps, AI Integration, Linux Systems, Cloud Architecture';
  const roles = rolesText.split(',').map((r) => r.trim());

  useEffect(() => {
    if (isLoading || roles.length === 0) return;
    const current = roles[roleIndex] || '';
    let timeout: ReturnType<typeof setTimeout>;

    if (!erasing && displayed.length < current.length) {
      timeout = setTimeout(() => setDisplayed(current.slice(0, displayed.length + 1)), 80);
    } else if (!erasing && displayed.length === current.length) {
      timeout = setTimeout(() => setErasing(true), 2500); // Wait longer on complete
    } else if (erasing && displayed.length > 0) {
      timeout = setTimeout(() => setDisplayed(displayed.slice(0, -1)), 40);
    } else if (erasing && displayed.length === 0) {
      timeout = setTimeout(() => { setErasing(false); setRoleIndex((i) => (i + 1) % roles.length); }, 80);
    }
    return () => clearTimeout(timeout);
  }, [displayed, erasing, roleIndex, roles, isLoading]);

  if (isLoading) return null;

  return (
    <section className="min-h-screen flex flex-col justify-center items-center relative px-6 text-center select-none overflow-hidden">
      {/* Subtle warm layout grid patterns */}
      <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full blur-3xl pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(212, 175, 55, 0.03) 0%, transparent 70%)' }} />

      <div className="relative z-10 space-y-6 max-w-4xl flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="mb-2"
        >
          <img 
            src="/logo.png" 
            alt="Logo" 
            className="w-20 h-20 sm:w-24 sm:h-24 object-contain shadow-warm-md rounded-full bg-white/10 p-1 border border-white/20 backdrop-blur-md" 
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: 'easeOut' }}
          className="mono text-xs tracking-[0.25em] uppercase"
          style={{ color: 'var(--text-secondary)' }}
        >
          {settings.home_greeting || 'Portfolio Journey'}
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2, ease: 'easeOut' }}
          className="text-5xl sm:text-7xl md:text-8xl font-bold tracking-tight"
          style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.03em' }}
        >
          <span style={{ color: 'var(--text-primary)' }}>{name.split(' ')[0]}</span>{' '}
          <span className="gradient-text">{name.split(' ').slice(1).join(' ')}</span>
        </motion.h1>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-xl sm:text-2xl font-light h-8 flex items-center justify-center"
        >
          <span className="mono mr-2 opacity-50" style={{ color: 'var(--accent-primary)' }}>{'>'}</span>
          <span className="typewriter font-medium" style={{ color: 'var(--accent-primary)', fontFamily: 'var(--font-mono)' }}>
            {displayed}
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="max-w-xl mx-auto text-sm leading-relaxed"
          style={{ color: 'var(--text-secondary)' }}
        >
          <MarkdownRenderer content={settings.home_tag || 'Evolving from basic scripting to designing robust orchestration architectures.'} />
        </motion.div>
      </div>

      {/* Floating scroll hint at bottom */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ 
          duration: 0.8, 
          delay: 1.2,
          repeat: Infinity, 
          repeatType: 'reverse' 
        }}
        className="absolute bottom-10 flex flex-col items-center gap-2 cursor-pointer z-10"
        onClick={() => {
          window.scrollTo({
            top: window.innerHeight,
            behavior: 'smooth'
          });
        }}
      >
        <span className="mono text-[10px] tracking-widest uppercase opacity-75" style={{ color: 'var(--text-secondary)' }}>
          Begin Journey
        </span>
        <div 
          className="w-5 h-8 border-2 rounded-full flex justify-center p-1"
          style={{ borderColor: 'var(--accent-secondary)' }}
        >
          <motion.div 
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="w-1 h-1.5 rounded-full" 
            style={{ background: 'var(--accent-primary)' }}
          />
        </div>
      </motion.div>
    </section>
  );
}
