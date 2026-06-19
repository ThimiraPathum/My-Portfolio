import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  SiHtml5, SiCss, SiJavascript, SiTypescript, SiReact, SiTailwindcss, SiNodedotjs, 
  SiPhp, SiLaravel, SiMysql, SiPostgresql, SiMongodb, SiDocker, SiGit, SiLinux, 
  SiPython, SiFramer, SiVite, SiExpress, SiNextdotjs, SiVuedotjs, SiAngular, SiDotnet,
  SiOpenjdk, SiCplusplus, SiSharp, SiFirebase, SiRedis, SiPostman, SiFigma,
  SiGithub, SiVercel, SiNetlify, SiGo, SiRust
} from 'react-icons/si';
import { getSkills } from '../api';

interface Skill {
  id: number;
  name: string;
  category: string;
  level: number;
  icon?: string;
}

const getIcon = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes('html')) return <SiHtml5 className="text-[#E34F26]" />;
  if (n.includes('css')) return <SiCss className="text-[#1572B6]" />;
  if (n.includes('javascript') || n.includes('js')) return <SiJavascript className="text-[#F7DF1E]" />;
  if (n.includes('typescript') || n.includes('ts')) return <SiTypescript className="text-[#3178C6]" />;
  if (n.includes('react')) return <SiReact className="text-[#61DAFB]" />;
  if (n.includes('vue')) return <SiVuedotjs className="text-[#4FC08D]" />;
  if (n.includes('angular')) return <SiAngular className="text-[#DD0031]" />;
  if (n.includes('tailwind')) return <SiTailwindcss className="text-[#06B6D4]" />;
  if (n.includes('node')) return <SiNodedotjs className="text-[#339933]" />;
  if (n.includes('express')) return <SiExpress style={{ color: 'var(--text-primary)' }} />;
  if (n.includes('php')) return <SiPhp className="text-[#777BB4]" />;
  if (n.includes('laravel')) return <SiLaravel className="text-[#FF2D20]" />;
  if (n.includes('dotnet') || n.includes('.net')) return <SiDotnet className="text-[#512BD4]" />;
  if (n.includes('java')) return <SiOpenjdk className="text-[#007396]" />;
  if (n.includes('python')) return <SiPython className="text-[#3776AB]" />;
  if (n.includes('c++') || n.includes('cpp')) return <SiCplusplus className="text-[#00599C]" />;
  if (n.includes('c#')) return <SiSharp className="text-[#239120]" />;
  if (n.includes('go')) return <SiGo className="text-[#00ADD8]" />;
  if (n.includes('rust')) return <SiRust style={{ color: 'var(--text-primary)' }} />;
  if (n.includes('mysql')) return <SiMysql className="text-[#4479A1]" />;
  if (n.includes('postgres')) return <SiPostgresql className="text-[#4169E1]" />;
  if (n.includes('mongo')) return <SiMongodb className="text-[#47A248]" />;
  if (n.includes('firebase')) return <SiFirebase className="text-[#FFCA28]" />;
  if (n.includes('redis')) return <SiRedis className="text-[#DC382D]" />;
  if (n.includes('docker')) return <SiDocker className="text-[#2496ED]" />;
  if (n.includes('git')) return <SiGit className="text-[#F05032]" />;
  if (n.includes('github')) return <SiGithub style={{ color: 'var(--text-primary)' }} />;
  if (n.includes('linux')) return <SiLinux className="text-[#FCC624]" />;
  if (n.includes('framer')) return <SiFramer style={{ color: 'var(--text-primary)' }} />;
  if (n.includes('vite')) return <SiVite className="text-[#646CFF]" />;
  if (n.includes('next')) return <SiNextdotjs style={{ color: 'var(--text-primary)' }} />;
  if (n.includes('postman')) return <SiPostman className="text-[#FF6C37]" />;
  if (n.includes('figma')) return <SiFigma className="text-[#F24E1E]" />;
  if (n.includes('photoshop')) return <SiFigma className="text-[#31A8FF]" />;
  if (n.includes('vercel')) return <SiVercel style={{ color: 'var(--text-primary)' }} />;
  if (n.includes('netlify')) return <SiNetlify className="text-[#00C7B7]" />;
  return null;
};

const getLevelLabel = (level: number) => {
  if (level >= 90) return 'Expert';
  if (level >= 75) return 'Advanced';
  if (level >= 50) return 'Intermediate';
  return 'Skilled';
};

export default function Skills() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSkills()
      .then(({ data }) => setSkills(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const categories = [...new Set(skills.map((s) => s.category))].sort((a, b) => {
    const order: Record<string, number> = { 'Frontend': 1, 'Backend': 2, 'Database': 3, 'Tools': 4 };
    return (order[a] || 99) - (order[b] || 99);
  });

  return (
    <section className="pt-24 pb-20 px-4 sm:px-6 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Heading */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-16 text-center">
          <div className="mono text-xs mb-3 tracking-[0.3em] uppercase" style={{ color: 'var(--accent-primary)' }}>{'>'} tech.expertise()</div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
            Core <span className="gradient-text">Skills</span>
          </h1>
          <p className="max-w-2xl mx-auto text-sm sm:text-base leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            A comprehensive overview of my technical arsenal, specialized in building scalable full-stack applications and modern digital experiences.
          </p>
          <div className="mt-8 flex justify-center">
            <div className="h-px w-32 opacity-50" style={{ background: 'linear-gradient(to right, transparent, var(--accent-secondary), transparent)' }} />
          </div>
        </motion.div>

        {loading ? (
          <div className="space-y-16">
            {[...Array(3)].map((_, i) => (
              <div key={i}>
                <div className="h-6 w-32 glass animate-pulse mb-8" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[...Array(4)].map((_, j) => (
                    <div key={j} className="glass h-20 animate-pulse" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-20">
            {categories.map((cat, catIdx) => (
              <motion.section
                key={cat}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: catIdx * 0.1, duration: 0.6 }}
              >
                <div className="flex items-center gap-4 mb-10">
                  <h3 className="text-lg font-bold uppercase tracking-[0.2em] whitespace-nowrap" style={{ color: 'var(--accent-secondary)', fontFamily: 'var(--font-display)' }}>
                    <span className="mr-2 opacity-50" style={{ color: 'var(--accent-primary)' }}>#</span> {cat}
                  </h3>
                  <div className="h-px w-full" style={{ background: 'var(--border)' }} />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {skills
                    .filter((s) => s.category === cat)
                    .sort((a, b) => b.level - a.level)
                    .map((skill, i) => (
                      <motion.div
                        key={skill.id}
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: (catIdx * 0.05) + (i * 0.03), duration: 0.4 }}
                        className="glass glass-hover p-5 flex items-center gap-4"
                      >
                        {/* Icon */}
                        <div className="text-2xl flex-shrink-0 w-10 flex items-center justify-center">
                          {getIcon(skill.name) || (
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold"
                              style={{ background: 'linear-gradient(135deg, rgba(232, 116, 29, 0.15), rgba(212, 175, 55, 0.15))', color: 'var(--accent-primary)' }}>
                              {skill.name.slice(0, 2).toUpperCase()}
                            </div>
                          )}
                        </div>

                        {/* Name + Bar */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{skill.name}</h4>
                            <span className="text-[9px] mono uppercase tracking-widest font-bold px-2 py-0.5 rounded flex-shrink-0 ml-2"
                              style={{
                                background: skill.level >= 75 ? 'rgba(232, 116, 29, 0.08)' : 'rgba(139, 115, 85, 0.08)',
                                color: skill.level >= 75 ? 'var(--accent-primary)' : 'var(--text-secondary)',
                                border: `1px solid ${skill.level >= 75 ? 'rgba(232, 116, 29, 0.2)' : 'var(--border)'}`,
                              }}>
                              {getLevelLabel(skill.level)}
                            </span>
                          </div>
                          
                          {/* Skill bar */}
                          <div className="w-full h-1.5 rounded-full" style={{ background: 'var(--bg-secondary)' }}>
                            <motion.div 
                               className="h-full rounded-full"
                              style={{
                                background: 'linear-gradient(90deg, #E8741D, #D4AF37)',
                                filter: 'drop-shadow(0 0 4px rgba(232, 116, 29, 0.3))',
                              }}
                              initial={{ width: 0 }}
                              whileInView={{ width: `${skill.level}%` }}
                              viewport={{ once: true }}
                              transition={{ duration: 1.5, delay: 0.3 + (i * 0.05) }}
                            />
                          </div>
                        </div>
                      </motion.div>
                    ))}
                </div>
              </motion.section>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
