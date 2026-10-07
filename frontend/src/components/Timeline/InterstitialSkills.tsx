import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getSkills } from '../../api';
import TimelineNode from './TimelineNode';

interface SkillItem {
  id: number;
  name: string;
  category: string;
  level: number;
}

interface InterstitialSkillsProps {
  id: string;
  type: 'skills-reveal' | 'skills-mastery';
  year: string;
  title: string;
  subtitle: string;
  description: string;
  isActive: boolean;
  onActive: (id: string) => void;
}

export default function InterstitialSkills({
  id,
  type,
  year,
  title,
  subtitle,
  description,
  isActive,
  onActive,
}: InterstitialSkillsProps) {
  const [skills, setSkills] = useState<SkillItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (type === 'skills-mastery') {
      getSkills()
        .then(({ data }) => setSkills(data))
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [type]);

  // Group skills by category for "mastery" view
  const categories = [...new Set(skills.map((s) => s.category))].sort((a, b) => {
    const order: Record<string, number> = { 'Frontend': 1, 'Backend': 2, 'Database': 3, 'DevOps': 4 };
    return (order[a] || 99) - (order[b] || 99);
  });

  const cardVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.8, ease: 'easeOut' as const }
    }
  };

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-20% 0px -20% 0px' }}
      variants={cardVariants}
      onViewportEnter={() => onActive(id)}
      className="relative flex flex-col items-start w-full py-16 scroll-mt-24"
    >
      {/* Node Dot aligned with Spine */}
      <TimelineNode featured={true} type={type} isActive={isActive} year={year} />

      <div className="w-full pr-0 md:pr-[120px] lg:pr-[25%]">
        <div className="w-full milestone-card p-8 sm:p-10 border relative overflow-hidden">
          <div className="space-y-6">
            {/* Header info */}
            <div className="space-y-1">
              <span className="mono text-[10px] uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>
                {subtitle}
              </span>
              <h3 
                className="text-3xl font-semibold tracking-tight"
                style={{ 
                  fontFamily: 'var(--font-display)', 
                  color: 'var(--accent-primary)',
                  letterSpacing: '-0.02em'
                }}
              >
                {title}
              </h3>
              <p className="text-sm leading-relaxed max-w-2xl pt-2" style={{ color: 'var(--text-secondary)' }}>
                {description}
              </p>
            </div>

            {/* Content for skills-reveal (Static fundamental badges) */}
            {type === 'skills-reveal' && (
              <div className="flex flex-wrap gap-3 pt-2">
                {['Python', 'PHP', 'Laravel', 'MySQL', 'Linux Basics', 'Networking'].map((item) => (
                  <div 
                    key={item}
                    className="px-4 py-2 rounded-xl border text-xs font-semibold mono"
                    style={{
                      background: 'rgba(212, 175, 55, 0.05)',
                      color: 'var(--accent-secondary)',
                      borderColor: 'rgba(212, 175, 55, 0.2)'
                    }}
                  >
                    {item}
                  </div>
                ))}
              </div>
            )}

            {/* Content for skills-mastery (Dynamic domain proficiency bars) */}
            {type === 'skills-mastery' && (
              loading ? (
                <div className="space-y-6 pt-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-10 bg-[var(--bg-secondary)]/20 animate-pulse rounded-lg" />
                  ))}
                </div>
              ) : (
                <div className="space-y-8 pt-4">
                  {categories.map((cat) => (
                    <div key={cat} className="space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-widest mono text-[var(--accent-secondary)]">
                        {cat}
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                        {skills
                          .filter((s) => s.category === cat)
                          .sort((a, b) => b.level - a.level)
                          .map((skill) => (
                            <div key={skill.id} className="space-y-1.5">
                              <div className="flex justify-between items-center text-xs">
                                <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                                  {skill.name}
                                </span>
                              </div>
                              {/* Horizontal progress bar */}
                              <div className="w-full h-2 rounded-full" style={{ background: 'var(--bg-secondary)' }}>
                                <motion.div 
                                  className="h-full rounded-full"
                                  style={{
                                    background: 'linear-gradient(90deg, var(--accent-primary), var(--accent-secondary))',
                                    filter: 'drop-shadow(0 0 4px rgba(232, 116, 29, 0.25))'
                                  }}
                                  initial={{ width: 0 }}
                                  whileInView={{ width: `${skill.level}%` }}
                                  viewport={{ once: true }}
                                  transition={{ duration: 1.2, ease: 'easeOut' }}
                                />
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
