import Brand from './Brand';
import { useSettings } from '../context/useSettings';
import { FiGithub, FiLinkedin, FiMail, FiCode } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const quickLinks = [
  { label: 'Home', sectionId: 'home-section' },
  { label: 'About', sectionId: 'about-section' },
  { label: 'Projects', sectionId: 'projects-section' },
  { label: 'Skills', sectionId: 'skills-section' },
  { label: 'Education', sectionId: 'experience-section' },
  { label: 'Blog', route: '/blog' },
  { label: 'Contact', sectionId: 'contact-section' },
];

export default function Footer() {
  const { settings } = useSettings();
  const socials = [
    { icon: FiGithub, href: settings.social_github, label: 'GitHub' },
    { icon: FiLinkedin, href: settings.social_linkedin, label: 'LinkedIn' },
    { icon: FiMail, href: settings.social_email ? 'mailto:' + settings.social_email : '', label: 'Email' },
  ].filter(social => social.href);
  const navigate = useNavigate();

  const handleLink = (item: typeof quickLinks[0]) => {
    if (item.route) {
      navigate(item.route);
      return;
    }

    if (item.sectionId) {
      navigate({ pathname: '/', hash: `#${item.sectionId}` });
    }
  };

  return (
    <footer style={{ borderTop: '1px solid rgba(212, 175, 55, 0.15)', background: 'var(--bg-primary)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-12 pb-6">

        {/* Top — stacked on mobile, 3 cols on md+ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 mb-10">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Brand name={settings.home_name || 'Thimira Pathum'} />
            </div>

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
                  className="p-2 rounded-lg transition-colors duration-200 flex-shrink-0 cursor-pointer"
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

          {/* Navigation */}
          <div>
            <div className="mono text-xs font-semibold tracking-widest mb-4" style={{ color: 'var(--accent-primary)' }}>
              NAVIGATION
            </div>
            <ul className="grid grid-cols-2 gap-x-4 gap-y-2.5">
              {quickLinks.map((item) => (
                <li key={item.label}>
                  <button
                    onClick={() => handleLink(item)}
                    className="text-xs bg-transparent border-0 cursor-pointer p-0 transition-colors duration-200"
                    style={{ color: 'var(--text-secondary)' }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--accent-primary)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-secondary)'; }}
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Let's Connect */}
          <div>
            <div className="mono text-xs font-semibold tracking-widest mb-4" style={{ color: 'var(--accent-primary)' }}>
              LET'S CONNECT
            </div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full animate-pulse flex-shrink-0" style={{ background: '#6BA576' }} />
              <span className="mono text-xs" style={{ color: 'var(--text-secondary)' }}>
                Open for internships & projects
              </span>
            </div>
            <p className="text-xs leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>
              Have an idea or opportunity? I'd love to hear from you.
            </p>
            <a
              href="mailto:kasthuriarachchipathum@gmail.com"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-opacity duration-200 cursor-pointer"
              style={{ background: 'linear-gradient(135deg, #E8741D, #D4AF37)', color: '#FAF4EF' }}
              onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.85'; }}
              onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
            >
              Say Hello →
            </a>
          </div>
        </div>

        {/* Divider */}
        <div
          className="h-px w-full rounded-full mb-5"
          style={{ background: 'linear-gradient(to right, transparent, rgba(212,175,55,0.3), transparent)' }}
        />

        {/* Bottom bar — stacked center on mobile */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <div className="flex items-center gap-1.5">
            <FiCode size={11} style={{ color: 'var(--accent-primary)' }} />
            <span className="mono text-xs" style={{ color: 'var(--text-secondary)' }}>
              © {new Date().getFullYear()} {settings.home_name || 'Thimira Pathum'}. All rights reserved.
            </span>
          </div>

        </div>

      </div>
    </footer>
  );
}
