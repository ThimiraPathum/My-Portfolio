import { FiGithub, FiLinkedin, FiMail, FiCode } from 'react-icons/fi';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';

const socials = [
  { icon: FiGithub,   href: 'https://github.com/THIMIRAPATHUM',           label: 'GitHub' },
  { icon: FiLinkedin, href: 'https://linkedin.com/in/thimira-pathum',       label: 'LinkedIn' },
  { icon: FiMail,     href: 'mailto:kasthuriarachchipathum@gmail.com',       label: 'Email' },
];

const quickLinks = [
  { to: '/',           label: 'Home' },
  { to: '/about',      label: 'About' },
  { to: '/projects',   label: 'Projects' },
  { to: '/skills',     label: 'Skills' },
  { to: '/experience', label: 'Education' },
  { to: '/contact',    label: 'Contact' },
];

export default function Footer() {
  return (
    <footer
      style={{
        borderTop: '1px solid rgba(212, 175, 55, 0.15)',
        background: 'var(--bg-primary)',
      }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-14 pb-8">

        {/* Top row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-12">

          {/* Brand block */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <img src="/logo.png" alt="Logo" className="h-8 w-8 object-contain rounded-full" />
              <span
                className="font-bold text-base tracking-tight"
                style={{
                  background: 'linear-gradient(135deg, #1a0a00 0%, #D4AF37 40%, #E8741D 70%, #0d0500 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  fontFamily: 'var(--font-display)',
                }}
              >
                Thimira Pathum
              </span>
            </div>
            <p className="text-xs leading-relaxed mb-4" style={{ color: 'var(--text-secondary)', maxWidth: '220px' }}>
              Undergraduate at University of Colombo School of Computing · ICT
            </p>
            <div className="flex items-center gap-2">
              {socials.map(({ icon: Icon, href, label }) => (
                <motion.a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 rounded-lg transition-colors duration-200"
                  style={{ border: '1px solid rgba(212, 175, 55, 0.2)', color: 'var(--text-secondary)' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = 'var(--accent-primary)';
                    e.currentTarget.style.borderColor = 'rgba(232, 116, 29, 0.4)';
                    e.currentTarget.style.background = 'rgba(232, 116, 29, 0.06)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'var(--text-secondary)';
                    e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.2)';
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <Icon size={15} />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <div>
            <div className="mono text-xs font-semibold tracking-widest mb-4" style={{ color: 'var(--accent-primary)' }}>
              NAVIGATION
            </div>
            <ul className="grid grid-cols-2 gap-x-4 gap-y-2">
              {quickLinks.map(({ to, label }) => (
                <li key={to}>
                  <NavLink
                    to={to}
                    className="text-xs transition-colors duration-200 hover:text-orange-500"
                    style={{ color: 'var(--text-secondary)' }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--accent-primary)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-secondary)'; }}
                  >
                    {label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Let's Connect CTA */}
          <div>
            <div className="mono text-xs font-semibold tracking-widest mb-4" style={{ color: 'var(--accent-primary)' }}>
              LET'S CONNECT
            </div>
            {/* Availability badge */}
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#6BA576' }} />
              <span className="mono text-xs" style={{ color: 'var(--text-secondary)' }}>
                Available for internships & projects
              </span>
            </div>
            <p className="text-xs mb-5 leading-relaxed" style={{ color: 'var(--text-secondary)', maxWidth: '220px' }}>
              Have an idea or opportunity? I'd love to hear from you and collaborate.
            </p>
            <a
              href="mailto:kasthuriarachchipathum@gmail.com"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200"
              style={{
                background: 'linear-gradient(135deg, #E8741D, #D4AF37)',
                color: '#FAF4EF',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.85'; }}
              onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
            >
              Say Hello →
            </a>
          </div>
        </div>

        {/* Divider */}
        <div
          className="h-px w-full rounded-full mb-6"
          style={{ background: 'linear-gradient(to right, transparent, rgba(212,175,55,0.3), transparent)' }}
        />

        {/* Bottom row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-1.5">
            <FiCode size={12} style={{ color: 'var(--accent-primary)' }} />
            <span className="mono text-xs" style={{ color: 'var(--text-secondary)' }}>
              © {new Date().getFullYear()} Thimira Pathum. All rights reserved.
            </span>
          </div>
          <span className="mono text-xs" style={{ color: 'var(--text-secondary)', opacity: 0.5 }}>
            University of Colombo · ICT
          </span>
        </div>

      </div>
    </footer>
  );
}
