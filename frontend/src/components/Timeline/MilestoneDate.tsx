import { motion } from 'framer-motion';

interface MilestoneDateProps {
  year: string;
}

export default function MilestoneDate({ year }: MilestoneDateProps) {
  return (
    <motion.div 
      whileHover={{ scale: 1.05 }}
      className="inline-block px-3 py-1 rounded-full text-xs font-semibold tracking-wider mono uppercase border select-none transition-colors"
      style={{
        background: 'rgba(212, 175, 55, 0.1)',
        color: 'var(--accent-secondary)',
        borderColor: 'rgba(212, 175, 55, 0.25)',
      }}
    >
      {year}
    </motion.div>
  );
}
