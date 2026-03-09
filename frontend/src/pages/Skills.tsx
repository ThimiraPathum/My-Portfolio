import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getSkills } from '../api';

interface Skill {
  id: number;
  name: string;
  category: string;
  level: number;
}

export default function Skills() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSkills()
      .then(({ data }) => setSkills(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const categories = [...new Set(skills.map((s) => s.category))];

  return (
    <main className="pt-24 pb-20 px-4 sm:px-6 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Heading */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <div className="mono text-xs text-cyan-400 mb-3 tracking-widest">{'>'} skills.enumerate()</div>
          <h1 className="section-heading mb-4">
            Tech <span className="gradient-text">Stack</span>
          </h1>
          <div className="h-px w-24 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full" />
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="glass h-40 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {categories.map((cat, catIdx) => (
              <motion.div
                key={cat}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: catIdx * 0.1 }}
                className="glass p-6"
              >
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-2 h-2 rounded-full bg-cyan-400" />
                  <h3 className="text-sm font-semibold text-cyan-400 mono">{cat}</h3>
                </div>

                <div className="space-y-5">
                  {skills
                    .filter((s) => s.category === cat)
                    .map((skill, i) => (
                      <div key={skill.id}>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-gray-200">{skill.name}</span>
                          <span className="mono text-xs text-cyan-400">{skill.level}%</span>
                        </div>
                        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500"
                            initial={{ width: 0 }}
                            animate={{ width: `${skill.level}%` }}
                            transition={{ delay: catIdx * 0.1 + i * 0.08 + 0.3, duration: 0.8, ease: 'easeOut' }}
                          />
                        </div>
                      </div>
                    ))}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
