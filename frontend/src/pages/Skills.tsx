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
  if (n.includes('express')) return <SiExpress className="text-white" />;
  if (n.includes('php')) return <SiPhp className="text-[#777BB4]" />;
  if (n.includes('laravel')) return <SiLaravel className="text-[#FF2D20]" />;
  if (n.includes('dotnet') || n.includes('.net')) return <SiDotnet className="text-[#512BD4]" />;
  if (n.includes('java')) return <SiOpenjdk className="text-[#007396]" />;
  if (n.includes('python')) return <SiPython className="text-[#3776AB]" />;
  if (n.includes('c++') || n.includes('cpp')) return <SiCplusplus className="text-[#00599C]" />;
  if (n.includes('c#')) return <SiSharp className="text-[#239120]" />;
  if (n.includes('go')) return <SiGo className="text-[#00ADD8]" />;
  if (n.includes('rust')) return <SiRust className="text-white" />;
  if (n.includes('mysql')) return <SiMysql className="text-[#4479A1]" />;
  if (n.includes('postgres')) return <SiPostgresql className="text-[#4169E1]" />;
  if (n.includes('mongo')) return <SiMongodb className="text-[#47A248]" />;
  if (n.includes('firebase')) return <SiFirebase className="text-[#FFCA28]" />;
  if (n.includes('redis')) return <SiRedis className="text-[#DC382D]" />;
  if (n.includes('docker')) return <SiDocker className="text-[#2496ED]" />;
  if (n.includes('git')) return <SiGit className="text-[#F05032]" />;
  if (n.includes('github')) return <SiGithub className="text-white" />;
  if (n.includes('linux')) return <SiLinux className="text-[#FCC624]" />;
  if (n.includes('framer')) return <SiFramer className="text-white" />;
  if (n.includes('vite')) return <SiVite className="text-[#646CFF]" />;
  if (n.includes('next')) return <SiNextdotjs className="text-white" />;
  if (n.includes('postman')) return <SiPostman className="text-[#FF6C37]" />;
  if (n.includes('figma')) return <SiFigma className="text-[#F24E1E]" />;
  if (n.includes('photoshop')) return <SiFigma className="text-[#31A8FF]" />; // Temporary fallback or different icon
  if (n.includes('vercel')) return <SiVercel className="text-white" />;
  if (n.includes('netlify')) return <SiNetlify className="text-[#00C7B7]" />;
  return null;
};

const getLevelLabel = (level: number) => {
  if (level >= 90) return 'Expert';
  if (level >= 75) return 'Advanced';
  if (level >= 50) return 'Intermediate';
  return 'Skilled';
};

const getLevelColor = (level: number) => {
  if (level >= 90) return 'from-cyan-400 to-blue-500';
  if (level >= 75) return 'from-purple-400 to-pink-500';
  if (level >= 50) return 'from-green-400 to-emerald-500';
  return 'from-gray-400 to-gray-500';
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
    // Custom sort to prioritize certain categories
    const order: Record<string, number> = { 'Frontend': 1, 'Backend': 2, 'Database': 3, 'Tools': 4 };
    return (order[a] || 99) - (order[b] || 99);
  });

  return (
    <main className="pt-24 pb-20 px-4 sm:px-6 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Heading */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-16 text-center">
          <div className="mono text-xs text-cyan-400 mb-3 tracking-[0.3em] uppercase">{'>'} tech.expertise()</div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6">
            Core <span className="gradient-text">Skills</span>
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
            A comprehensive overview of my technical arsenal, specialized in building scalable full-stack applications and modern digital experiences.
          </p>
          <div className="mt-8 flex justify-center">
            <div className="h-px w-32 bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-50" />
          </div>
        </motion.div>

        {loading ? (
          <div className="space-y-16">
            {[...Array(3)].map((_, i) => (
              <div key={i}>
                <div className="h-6 w-32 glass animate-pulse mb-8" />
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {[...Array(5)].map((_, j) => (
                    <div key={j} className="glass h-32 animate-pulse" />
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
                  <h3 className="text-lg font-bold text-white uppercase tracking-[0.2em] mono whitespace-nowrap">
                    <span className="text-cyan-400 mr-2 opacity-50">#</span> {cat}
                  </h3>
                  <div className="h-px w-full bg-white/5 shadow-[0_0_10px_rgba(255,255,255,0.05)]" />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
                  {skills
                    .filter((s) => s.category === cat)
                    .sort((a, b) => b.level - a.level)
                    .map((skill, i) => (
                      <motion.div
                        key={skill.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        whileHover={{ y: -5, scale: 1.02 }}
                        viewport={{ once: true }}
                        transition={{ 
                          type: "spring",
                          stiffness: 300,
                          damping: 20,
                          delay: (catIdx * 0.1) + (i * 0.05) 
                        }}
                        className="group relative"
                      >
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-400/20 to-blue-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500" />
                        <div className="relative glass p-6 h-full flex flex-col items-center justify-center text-center border-white/5 hover:border-cyan-400/30 transition-all duration-300 rounded-2xl shadow-xl overflow-hidden">
                          {/* Glow background */}
                          <div className="absolute -top-10 -right-10 w-24 h-24 bg-cyan-400/5 blur-[40px] rounded-full group-hover:bg-cyan-400/10 transition-colors" />
                          
                          <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-500 filter drop-shadow-[0_0_8px_rgba(0,0,0,0.5)]">
                            {getIcon(skill.name) || <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400/20 to-blue-500/20 flex items-center justify-center text-xs text-cyan-400 font-bold">ST</div>}
                          </div>
                          
                          <h4 className="text-sm font-semibold text-gray-100 mb-2 truncate w-full group-hover:text-cyan-400 transition-colors">{skill.name}</h4>
                          
                          <div className="flex flex-col items-center gap-1">
                            <span className={`text-[8px] sm:text-[10px] mono uppercase tracking-widest font-bold px-2 py-1 rounded bg-white/5 border border-white/10 ${skill.level >= 75 ? 'text-cyan-400 border-cyan-400/20' : 'text-gray-500'}`}>
                              {getLevelLabel(skill.level)}
                            </span>
                          </div>

                          {/* Level visual indicator (subtle) */}
                          <div className="absolute bottom-0 left-0 w-full h-[2px] bg-white/5">
                            <motion.div 
                              className={`h-full bg-gradient-to-r ${getLevelColor(skill.level)} opacity-30 shadow-[0_0_8px_rgba(34,211,238,0.5)]`}
                              initial={{ width: 0 }}
                              whileInView={{ width: `${skill.level}%` }}
                              viewport={{ once: true }}
                              transition={{ duration: 1.5, delay: 0.5 }}
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
    </main>
  );
}
