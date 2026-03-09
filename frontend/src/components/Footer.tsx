import { FiGithub, FiLinkedin, FiMail, FiTerminal } from 'react-icons/fi';

const socials = [
  { icon: FiGithub,   href: 'https://github.com/thimira-pathum', label: 'GitHub' },
  { icon: FiLinkedin, href: 'https://linkedin.com/in/thimira-pathum', label: 'LinkedIn' },
  { icon: FiMail,     href: 'mailto:kasthuriarachchipathum@gmail.com', label: 'Email' },
];

export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-[#030712]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <div className="font-bold text-white text-sm mb-0.5">Thimira Pathum</div>
            <div className="flex items-center gap-2">
              <FiTerminal className="text-cyan-400" size={12} />
              <span className="mono text-xs text-gray-600">
                Undergraduate at University of Colombo
              </span>
            </div>
          </div>

          <p className="text-xs text-gray-600 mono text-center">
            "Designed with purpose, driven by innovation."
          </p>

          <div className="flex items-center gap-3">
            {socials.map(({ icon: Icon, href, label }) => (
              <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
                className="p-2.5 rounded-lg border border-white/5 text-gray-500 hover:text-cyan-400 hover:border-cyan-400/20 transition-all duration-200">
                <Icon size={16} />
              </a>
            ))}
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-white/5 text-center">
          <p className="text-xs text-gray-700 mono">
            © {new Date().getFullYear()} Thimira Pathum · Built with React + Laravel + JWT
          </p>
        </div>
      </div>
    </footer>
  );
}
