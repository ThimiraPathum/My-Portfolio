import { motion } from 'framer-motion';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const handleScrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <footer 
      className="w-full py-16 px-6 border-t select-none transition-colors"
      style={{
        backgroundColor: '#E6D7C3',
        borderColor: 'rgba(212, 175, 55, 0.2)',
      }}
    >
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
        
        {/* Left side info */}
        <div className="space-y-1">
          <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            Thimira Pathum
          </p>
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            &copy; {currentYear} &bull; Engineered with care and warm tones.
          </p>
        </div>

        {/* Right side start journey again */}
        <div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleScrollToTop}
            className="px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest border transition-all cursor-pointer"
            style={{
              borderColor: 'var(--accent-primary)',
              color: 'var(--accent-primary)',
              background: 'rgba(232, 116, 29, 0.05)',
            }}
          >
            End of journey. Start another? &uarr;
          </motion.button>
        </div>

      </div>
    </footer>
  );
}
