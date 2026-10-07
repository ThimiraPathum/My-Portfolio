import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  SiReact, SiTypescript, SiTailwindcss, SiPython, SiFastapi, 
  SiPostgresql, SiDocker, SiGithubactions, SiLinux, 
  SiPhp, SiLaravel, SiMysql, SiSqlite, SiMongodb, SiRedis
} from 'react-icons/si';
import { VscAzure } from 'react-icons/vsc';
import { getDerivedSkills as fetchDerivedSkillsApi } from '../api';

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
  'Java': 'Backend', 'Django': 'Backend', 'REST APIs': 'Backend', 'Laravel Sanctum': 'Backend',
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
  if (n === 'typescript') return <SiTypescript className="text-[#3178C6]" />;
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
        setSkills(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error('Failed to fetch derived skills:', err);
        setSkills([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const tabs = ['All', 'Frontend', 'Backend', 'DevOps', 'AI/ML', 'Database', 'Other'];

  const getCategory = (skillName: string): string => {
    return CATEGORY_MAP[skillName] || 'Other';
  };

  const sortedSkills = [...skills].sort((a, b) => (b.used_in?.length || 0) - (a.used_in?.length || 0));

  const filteredSkills = sortedSkills.filter((s) => {
    if (activeTab === 'All') return true;
    return getCategory(s.name) === activeTab;
  });

  return (
    <section id="skills-section" className="pt-24 pb-20 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Section Heading — Strictly Left-Aligned matching rest of portfolio */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-7">
          <div className="mono text-xs mb-3 tracking-widest" style={{ color: 'var(--accent-primary)' }}>
            {'>'} tech.expertise()
          </div>
          <h2 className="section-heading mb-4">
            Technical <span className="gradient-text">Skills</span>
          </h2>
          <div className="h-px w-24 rounded-full mb-6" style={{ background: 'linear-gradient(to right, var(--accent-secondary), var(--accent-primary))' }} />

          <p className="max-w-2xl text-sm sm:text-base leading-relaxed mb-6" style={{ color: 'var(--text-secondary)' }}>
            Technologies I use, with links to the projects where I use them.
          </p>

          {/* Category Filter Tabs — Flush Left */}
          <div className="flex flex-wrap gap-2">
            {tabs.map((tabLabel) => {
              const isActive = activeTab === tabLabel;
              return (
                <button
                  key={tabLabel}
                  aria-pressed={isActive}
                  onClick={() => setActiveTab(tabLabel)}
                  className="px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer"
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="glass h-28 animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : (
          <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
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
                    className="glass glass-hover p-4 flex flex-col gap-3 rounded-xl min-w-0"
                    style={{ border: '1px solid rgba(232, 116, 29, 0.15)' }}
                  >
                    <div>
                      {/* Header: Icon + Skill Name + Count Badge */}
                      <div className="flex items-center flex-wrap gap-x-3 gap-y-2">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <div className="text-xl w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                            style={{ background: 'rgba(232, 116, 29, 0.06)', border: '1px solid rgba(232, 116, 29, 0.12)' }}>
                            {icon || (
                              <span className="text-xs font-bold mono" style={{ color: 'var(--accent-primary)' }}>
                                {skill.name.slice(0, 2).toUpperCase()}
                              </span>
                            )}
                          </div>
                          <h3 className="text-base font-semibold break-words min-w-0" style={{ color: 'var(--text-primary)' }}>
                            {skill.name}
                          </h3>
                        </div>

                        <span className="text-xs font-medium px-2 py-1 rounded-full flex-shrink-0"
                          style={{
                            background: 'rgba(232, 116, 29, 0.12)',
                            color: 'var(--accent-primary)',
                            border: '1px solid rgba(232, 116, 29, 0.3)',
                          }}>
                          {count} project{count === 1 ? '' : 's'}
                        </span>
                      </div>
                    </div>

                    {/* Project Pills Tag List */}
                    <div className="min-w-0">
                      {count > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {skill.used_in.map((p) => (
                            <Link
                              to={`/project/${p.id}`}
                              key={p.id || p.title} 
                              className="text-xs px-2 py-1 rounded-md border max-w-full break-words hover:underline focus-visible:outline-2"
                              style={{
                                background: 'rgba(255, 255, 255, 0.04)',
                                color: 'var(--text-primary)',
                                borderColor: 'var(--border)',
                              }}
                            >
                              {p.title}
                            </Link>
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
          <div className="text-left py-12 mono text-sm" style={{ color: 'var(--text-secondary)' }}>
            No skills found for category "{activeTab}".
          </div>
        )}
      </div>
    </section>
  );
}
