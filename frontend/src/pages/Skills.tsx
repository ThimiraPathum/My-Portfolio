import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  SiReact, SiTypescript, SiTailwindcss, SiPython, SiFastapi, 
  SiPostgresql, SiDocker, SiGithubactions, SiLinux, 
  SiPhp, SiLaravel
} from 'react-icons/si';
import { VscAzure } from 'react-icons/vsc';
import { getDerivedSkills, type DerivedSkill } from '../lib/skills';

const getSkillIcon = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes('react')) return <SiReact className="text-[#61DAFB]" />;
  if (n.includes('typescript') || n.includes('ts')) return <SiTypescript className="text-[#3178C6]" />;
  if (n.includes('tailwind')) return <SiTailwindcss className="text-[#06B6D4]" />;
  if (n.includes('python')) return <SiPython className="text-[#3776AB]" />;
  if (n.includes('fastapi')) return <SiFastapi className="text-[#009688]" />;
  if (n.includes('langgraph')) return <div className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400 border border-purple-500/30">AI</div>;
  if (n.includes('postgres')) return <SiPostgresql className="text-[#4169E1]" />;
  if (n.includes('docker')) return <SiDocker className="text-[#2496ED]" />;
  if (n.includes('github')) return <SiGithubactions className="text-[#2088FF]" />;
  if (n.includes('azure')) return <VscAzure className="text-[#0089D6]" />;
  if (n.includes('linux')) return <SiLinux className="text-[#FCC624]" />;
  if (n.includes('php')) return <SiPhp className="text-[#777BB4]" />;
  if (n.includes('laravel')) return <SiLaravel className="text-[#FF2D20]" />;
  return null;
};

const getBadgeStyle = (level: string) => {
  if (level === 'Expert') {
    return {
      background: 'rgba(212, 175, 55, 0.12)',
      color: 'var(--accent-secondary)',
      border: '1px solid rgba(212, 175, 55, 0.3)',
    };
  }
  if (level === 'Advanced') {
    return {
      background: 'rgba(232, 116, 29, 0.12)',
      color: 'var(--accent-primary)',
      border: '1px solid rgba(232, 116, 29, 0.3)',
    };
  }
  return {
    background: 'rgba(255, 255, 255, 0.06)',
    color: 'var(--text-secondary)',
    border: '1px solid var(--border)',
  };
};

export default function Skills() {
  const [activeTab, setActiveTab] = useState<'all' | 'devops' | 'backend' | 'frontend'>('all');
  const allDerivedSkills: DerivedSkill[] = getDerivedSkills();

  const filteredSkills = allDerivedSkills.filter((skill) => {
    if (activeTab === 'all') return true;
    return skill.category === activeTab;
  });

  const tabs = [
    { key: 'all', label: 'All' },
    { key: 'devops', label: 'DevOps & Cloud' },
    { key: 'backend', label: 'Backend & AI' },
    { key: 'frontend', label: 'Frontend' },
  ];

  return (
    <section className="pt-24 pb-20 px-4 sm:px-6 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Heading */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-12 text-center">
          <div className="mono text-xs mb-3 tracking-[0.3em] uppercase" style={{ color: 'var(--accent-primary)' }}>
            {'>'} tech.expertise()
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
            Technical <span className="gradient-text">Skills</span>
          </h1>
          <p className="max-w-xl mx-auto text-sm sm:text-base leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            Derived directly from hands-on architecture, backend pipelines, cloud infrastructure, and production deployments.
          </p>

          {/* Category Filter Tabs */}
          <div className="mt-8 flex flex-wrap justify-center gap-2">
            {tabs.map((t) => {
              const isActive = activeTab === t.key;
              return (
                <button
                  key={t.key}
                  onClick={() => setActiveTab(t.key as typeof activeTab)}
                  className="px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
                  style={{
                    background: isActive ? 'rgba(232, 116, 29, 0.12)' : 'transparent',
                    color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
                    border: `1px solid ${isActive ? 'rgba(232, 116, 29, 0.35)' : 'var(--border)'}`,
                  }}
                >
                  {t.label}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Skills Cards Grid */}
        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <AnimatePresence>
            {filteredSkills.map((skill, index) => {
              const icon = getSkillIcon(skill.name);
              const badgeStyle = getBadgeStyle(skill.level);

              return (
                <motion.div
                  key={skill.name}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                  className="glass glass-hover p-6 flex flex-col justify-between rounded-2xl relative overflow-hidden"
                  style={{ border: '1px solid rgba(232, 116, 29, 0.15)' }}
                >
                  <div>
                    {/* Header: Icon/Initial + Name + Level Badge */}
                    <div className="flex items-center justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ background: 'rgba(232, 116, 29, 0.06)', border: '1px solid rgba(232, 116, 29, 0.12)' }}>
                          {icon || (
                            <span className="text-xs font-bold mono" style={{ color: 'var(--accent-primary)' }}>
                              {skill.name.slice(0, 2).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <h3 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
                          {skill.name}
                        </h3>
                      </div>
                      <span className="text-[10px] mono uppercase font-bold px-2.5 py-1 rounded-md tracking-wider flex-shrink-0"
                        style={badgeStyle}>
                        {skill.level}
                      </span>
                    </div>

                    {/* One-Line Description */}
                    <p className="text-xs leading-relaxed mb-6" style={{ color: 'var(--text-secondary)' }}>
                      {skill.desc}
                    </p>
                  </div>

                  {/* Used in N projects Tag at Bottom */}
                  <div className="pt-3 border-t border-[var(--border)] flex items-center justify-between">
                    <span className="text-[11px] mono flex items-center gap-1.5" style={{ color: 'var(--accent-secondary)' }}>
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--accent-primary)' }} />
                      used in {skill.count} project{skill.count === 1 ? '' : 's'}
                    </span>
                    {skill.usedIn.length > 0 && (
                      <span className="text-[10px] mono truncate max-w-[140px] opacity-60" style={{ color: 'var(--text-secondary)' }}>
                        {skill.usedIn.join(', ')}
                      </span>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
