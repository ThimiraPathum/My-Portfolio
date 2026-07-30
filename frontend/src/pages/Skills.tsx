import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  SiReact, SiTypescript, SiTailwindcss, SiPython, SiFastapi, 
  SiPostgresql, SiDocker, SiGithubactions, SiLinux, 
  SiPhp, SiLaravel, SiMysql, SiSqlite, SiMongodb, SiRedis
} from 'react-icons/si';
import { VscAzure } from 'react-icons/vsc';
import { getDerivedSkills as fetchDerivedSkillsApi } from '../api';
import { getDerivedSkills as getFallbackSkills } from '../lib/skills';

interface DerivedSkillItem {
  name: string;
  used_in: { id: number | string; title: string }[];
}

const CATEGORY_MAP: Record<string, string> = {
  // Frontend
  'React': 'Frontend', 'TypeScript': 'Frontend', 'JavaScript': 'Frontend',
  'Tailwind CSS': 'Frontend', 'Vite': 'Frontend', 'HTML': 'Frontend',
  'CSS': 'Frontend', 'Vue': 'Frontend', 'Next.js': 'Frontend',
  // Backend
  'Laravel': 'Backend', 'PHP': 'Backend', 'Python': 'Backend',
  'FastAPI': 'Backend', 'Node.js': 'Backend', 'Express': 'Backend',
  'Java': 'Backend', 'Django': 'Backend',
  // DevOps
  'Docker': 'DevOps', 'GitHub Actions': 'DevOps', 'Azure': 'DevOps',
  'Nginx': 'DevOps', 'Linux': 'DevOps', 'Terraform': 'DevOps',
  'Ansible': 'DevOps', 'AWS': 'DevOps',
  // AI/ML
  'LangGraph': 'AI/ML', 'Ollama': 'AI/ML', 'OpenAI API': 'AI/ML',
  'Groq': 'AI/ML', 'TensorFlow': 'AI/ML',
  // Database
  'PostgreSQL': 'Database', 'MySQL': 'Database', 'SQLite': 'Database',
  'MongoDB': 'Database', 'Redis': 'Database',
};

const getSkillIcon = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes('react')) return <SiReact className="text-[#61DAFB]" />;
  if (n.includes('typescript') || n.includes('ts')) return <SiTypescript className="text-[#3178C6]" />;
  if (n.includes('tailwind')) return <SiTailwindcss className="text-[#06B6D4]" />;
  if (n.includes('python')) return <SiPython className="text-[#3776AB]" />;
  if (n.includes('fastapi')) return <SiFastapi className="text-[#009688]" />;
  if (n.includes('langgraph') || n.includes('ollama') || n.includes('openai') || n.includes('groq')) {
    return <div className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400 border border-purple-500/30">AI</div>;
  }
  if (n.includes('postgres')) return <SiPostgresql className="text-[#4169E1]" />;
  if (n.includes('mysql')) return <SiMysql className="text-[#4479A1]" />;
  if (n.includes('sqlite')) return <SiSqlite className="text-[#003B57]" />;
  if (n.includes('mongo')) return <SiMongodb className="text-[#47A248]" />;
  if (n.includes('redis')) return <SiRedis className="text-[#DC382D]" />;
  if (n.includes('docker')) return <SiDocker className="text-[#2496ED]" />;
  if (n.includes('github')) return <SiGithubactions className="text-[#2088FF]" />;
  if (n.includes('azure')) return <VscAzure className="text-[#0089D6]" />;
  if (n.includes('linux')) return <SiLinux className="text-[#FCC624]" />;
  if (n.includes('php')) return <SiPhp className="text-[#777BB4]" />;
  if (n.includes('laravel')) return <SiLaravel className="text-[#FF2D20]" />;
  return null;
};

export default function Skills() {
  const [skills, setSkills] = useState<DerivedSkillItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');

  useEffect(() => {
    fetchDerivedSkillsApi()
      .then(({ data }) => {
        if (Array.isArray(data) && data.length > 0) {
          setSkills(data);
        } else {
          // Fallback to client-side derived skills if no projects exist in API yet
          const fallback = getFallbackSkills().map((s) => ({
            name: s.name,
            used_in: s.usedIn.map((title, idx) => ({ id: idx, title })),
          }));
          setSkills(fallback);
        }
      })
      .catch((err) => {
        console.error('Failed to fetch derived skills:', err);
        const fallback = getFallbackSkills().map((s) => ({
          name: s.name,
          used_in: s.usedIn.map((title, idx) => ({ id: idx, title })),
        }));
        setSkills(fallback);
      })
      .finally(() => setLoading(false));
  }, []);

  const tabs = ['All', 'Frontend', 'Backend', 'DevOps', 'AI/ML', 'Database', 'Other'];

  const getCategory = (skillName: string): string => {
    return CATEGORY_MAP[skillName] || 'Other';
  };

  // Sort skills by count (most used first)
  const sortedSkills = [...skills].sort((a, b) => (b.used_in?.length || 0) - (a.used_in?.length || 0));

  const filteredSkills = sortedSkills.filter((s) => {
    if (activeTab === 'All') return true;
    return getCategory(s.name) === activeTab;
  });

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
            Auto-derived directly from technology stacks across my live portfolio projects.
          </p>

          {/* Category Filter Tabs */}
          <div className="mt-8 flex flex-wrap justify-center gap-2">
            {tabs.map((tabLabel) => {
              const isActive = activeTab === tabLabel;
              return (
                <button
                  key={tabLabel}
                  onClick={() => setActiveTab(tabLabel)}
                  className="px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
                  style={{
                    background: isActive ? 'rgba(232, 116, 29, 0.12)' : 'transparent',
                    color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
                    border: `1px solid ${isActive ? 'rgba(232, 116, 29, 0.35)' : 'var(--border)'}`,
                  }}
                >
                  {tabLabel}
                </button>
              );
            })}
          </div>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="glass h-40 animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : (
          <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <AnimatePresence>
              {filteredSkills.map((skill, index) => {
                const icon = getSkillIcon(skill.name);
                const count = skill.used_in?.length || 0;

                return (
                  <motion.div
                    key={skill.name}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: index * 0.04, duration: 0.3 }}
                    className="glass glass-hover p-6 flex flex-col justify-between rounded-2xl relative overflow-hidden"
                    style={{ border: '1px solid rgba(232, 116, 29, 0.15)' }}
                  >
                    <div>
                      {/* Header: Icon + Skill Name + Count Badge */}
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <div className="flex items-center gap-3">
                          <div className="text-2xl w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                            style={{ background: 'rgba(232, 116, 29, 0.06)', border: '1px solid rgba(232, 116, 29, 0.12)' }}>
                            {icon || (
                              <span className="text-xs font-bold mono" style={{ color: 'var(--accent-primary)' }}>
                                {skill.name.slice(0, 2).toUpperCase()}
                              </span>
                            )}
                          </div>
                          <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                            {skill.name}
                          </h3>
                        </div>

                        {/* Used in X projects Badge */}
                        <span className="mono text-[10px] uppercase font-bold px-2.5 py-1 rounded-full tracking-wider flex-shrink-0"
                          style={{
                            background: 'rgba(232, 116, 29, 0.12)',
                            color: 'var(--accent-primary)',
                            border: '1px solid rgba(232, 116, 29, 0.3)',
                          }}>
                          Used in {count} project{count === 1 ? '' : 's'}
                        </span>
                      </div>
                    </div>

                    {/* Project Pills Tag List */}
                    <div className="pt-4 border-t border-[var(--border)]">
                      <div className="text-[10px] mono uppercase tracking-wider mb-2" style={{ color: 'var(--text-secondary)' }}>
                        Projects:
                      </div>
                      {count > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {skill.used_in.map((p) => (
                            <span 
                              key={p.id || p.title} 
                              className="text-[11px] px-2.5 py-1 rounded-md mono border"
                              style={{
                                background: 'rgba(255, 255, 255, 0.04)',
                                color: 'var(--text-primary)',
                                borderColor: 'var(--border)',
                              }}
                            >
                              {p.title}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs italic" style={{ color: 'var(--text-secondary)' }}>
                          No projects linked yet
                        </span>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}

        {!loading && filteredSkills.length === 0 && (
          <div className="text-center py-16 mono text-sm" style={{ color: 'var(--text-secondary)' }}>
            No skills found for category "{activeTab}".
          </div>
        )}
      </div>
    </section>
  );
}
