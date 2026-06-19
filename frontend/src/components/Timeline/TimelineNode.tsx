import { motion } from 'framer-motion';

interface TimelineNodeProps {
  featured: boolean;
  type: string;
  isActive: boolean;
  year: string;
}

export default function TimelineNode({ featured, type, isActive, year }: TimelineNodeProps) {
  // Determine color based on node type / category
  let nodeColor = 'var(--accent-primary)'; // default orange
  if (type === 'project') {
    nodeColor = featured ? 'var(--accent-primary)' : 'var(--accent-tertiary)';
  } else if (type === 'education' || type === 'experience') {
    nodeColor = 'var(--accent-secondary)'; // gold
  } else if (type === 'skills-reveal' || type === 'skills-mastery') {
    nodeColor = 'var(--text-muted)'; // rust/terracotta
  } else if (type === 'contact') {
    nodeColor = 'var(--accent-secondary)';
  }

  const baseSize = featured ? 20 : 12;
  const activeScale = isActive ? 1.4 : 1;

  return (
    <div className="absolute right-[60px] md:right-[10%] lg:right-[15%] top-1/2 -translate-y-1/2 translate-x-[4px] z-20 flex items-center justify-center pointer-events-none">
      {/* Dynamic expanding node */}
      <motion.div
        animate={{
          scale: activeScale,
          backgroundColor: isActive ? nodeColor : 'rgba(230, 215, 195, 0.6)',
          borderColor: isActive ? 'var(--bg-primary)' : 'rgba(230, 215, 195, 0.4)',
        }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="rounded-full border-4 relative cursor-pointer"
        style={{
          width: `${baseSize}px`,
          height: `${baseSize}px`,
          boxShadow: isActive 
            ? `0 0 15px ${nodeColor}, 0 0 30px ${nodeColor}55` 
            : 'none',
        }}
      >
        {/* Breathing pulse ring on active featured nodes */}
        {isActive && featured && (
          <motion.div 
            animate={{ scale: [1, 2], opacity: [0.6, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeOut' }}
            className="absolute inset-0 rounded-full border-2"
            style={{ borderColor: nodeColor, margin: '-6px' }}
          />
        )}

        {/* Small floating label showing year */}
        {isActive && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="absolute right-8 top-1/2 -translate-y-1/2 bg-[var(--text-primary)] text-[var(--bg-primary)] px-2 py-0.5 rounded text-[10px] font-bold mono whitespace-nowrap hidden md:block"
          >
            {year}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
