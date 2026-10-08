import LoadError from '../components/LoadError';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
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
  'Groq': 'AI/ML', 'TensorFlow': 'AI/ML', 'PyTorch': 'AI/ML', 'Scikit-learn': 'AI/ML', 'LangChain': 'AI/ML',
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
    return <span className="text-xs font-bold text-violet-700">AI</span>;
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
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const retry = () => {
    setError(false);
    setLoading(true);
    setAttempt(value => value + 1);
  };
  const [activeTab, setActiveTab] = useState('All');

  useEffect(() => {
    fetchDerivedSkillsApi()
      .then(({ data }) => {
        setSkills(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error(err);
        setError(true);
        setSkills([]);
      })
      .finally(() => setLoading(false));
  }, [attempt]);

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
    <section id="skills-section" aria-busy={loading} className="pt-24 pb-20 px-4 sm:px-6">
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
            The tools behind my work. Explore a category or see them in action.
          </p>

          <div className="flex flex-wrap gap-2" aria-label="Filter skills by category">
            {tabs.map((tabLabel) => {
              const count = tabLabel === 'All' ? skills.length : skills.filter(skill => getCategory(skill.name) === tabLabel).length;
              if (!loading && !error && count === 0 && tabLabel !== 'All') return null;
              const isActive = activeTab === tabLabel;
              return (
                <button
                  type="button"
                  key={tabLabel}
                  aria-pressed={isActive}
                  onClick={() => setActiveTab(tabLabel)}
                  className={`inline-flex min-h-11 items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-700 ${isActive ? 'border-stone-800 bg-stone-800 text-white' : 'border-stone-200 bg-white/70 text-stone-600 hover:border-orange-300 hover:text-stone-900'}`}
                >
                  {tabLabel}
                  {!loading && !error && <span className={`text-xs ${isActive ? 'text-stone-300' : 'text-stone-500'}`}>{count}</span>}
                </button>
              );
            })}
          </div>
        </motion.div>

        {error ? <LoadError subject="skills" onRetry={retry} /> : loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5" role="status" aria-label="Loading skills">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-64 animate-pulse rounded-2xl bg-white/70 border border-stone-200" />
            ))}
          </div>
        ) : (
          <div className={`grid gap-5 items-start ${activeTab === 'All' ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'}`}>
            {tabs.filter(category => category !== 'All').map(category => {
              const items = filteredSkills.filter(skill => getCategory(skill.name) === category);
              if (!items.length) return null;
              return (
                <motion.div key={category} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}
                  className="overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-sm">
                  <div className="flex items-center justify-between gap-3 border-b border-stone-100 px-5 py-4">
                    <h3 className="text-base font-semibold text-stone-900">{category}</h3>
                    <span className="text-xs text-stone-500">{items.length} {items.length === 1 ? 'skill' : 'skills'}</span>
                  </div>
                  <ul className={activeTab === 'All' ? 'divide-y divide-stone-100' : 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3'}>
                    {items.map(skill => (
                      <li key={skill.name} className="flex items-start gap-3 px-5 py-4 transition-colors hover:bg-orange-50/40 min-w-0">
                        <div aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-stone-50 text-2xl">
                          {getSkillIcon(skill.name) || <span className="text-xs font-semibold text-stone-600">{skill.name.slice(0, 2).toUpperCase()}</span>}
                        </div>
                        <div className="min-w-0 pt-0.5">
                          <h4 className="text-sm font-semibold text-stone-900 break-words">{skill.name}</h4>
                          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs leading-relaxed text-stone-500">
                            {skill.used_in.map((project, index) => (
                              <span key={project.id} className="min-w-0 max-w-full">
                                {index > 0 && <span aria-hidden="true" className="mr-2 text-stone-300">/</span>}
                                <Link to={`/project/${project.id}`} className="rounded-sm break-words underline decoration-stone-300 underline-offset-4 hover:text-orange-700 hover:decoration-orange-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-700">{project.title}</Link>
                              </span>
                            ))}
                            {skill.used_in.length === 0 && <span>No linked projects yet</span>}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              );
            })}
          </div>
        )}

        {!loading && !error && filteredSkills.length === 0 && (
          <div className="text-left py-12 mono text-sm" style={{ color: 'var(--text-secondary)' }}>
            No skills found for category "{activeTab}".
          </div>
        )}
      </div>
    </section>
  );
}
