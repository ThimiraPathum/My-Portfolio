import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiMapPin, FiCalendar } from 'react-icons/fi';
import { getExperiences } from '../api';

interface Experience {
  id: number;
  company: string;
  role: string;
  description: string;
  location: string | null;
  start_date: string;
  end_date: string | null;
  current: boolean;
  tech_stack: string[];
}

function formatDate(dateStr: string) {
  // Append T00:00:00 to force local-time parsing; plain 'YYYY-MM-DD' is
  // treated as UTC midnight by the spec, which causes off-by-one-day
  // errors for users in UTC+ timezones.
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

export default function Experience() {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getExperiences()
      .then(({ data }) => setExperiences(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="pt-24 pb-20 px-4 sm:px-6 min-h-screen">
      <div className="max-w-4xl mx-auto">
        {/* Heading */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <div className="mono text-xs text-cyan-400 mb-3 tracking-widest">{'>'} education.timeline()</div>
          <h1 className="section-heading mb-4">
            Education &amp; <span className="gradient-text">Experience</span>
          </h1>
          <div className="h-px w-24 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full" />
        </motion.div>

        {loading ? (
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="glass h-40 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="relative">
            {/* Timeline center line */}
            <div className="absolute left-6 top-4 bottom-4 w-px bg-gradient-to-b from-cyan-400/40 via-blue-500/20 to-transparent" />

            <div className="space-y-6 pl-16">
              {experiences.map((exp, i) => (
                <motion.div
                  key={exp.id}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.15, duration: 0.5 }}
                  className="relative"
                >
                  {/* Timeline dot */}
                  <div className="absolute -left-[42px] top-5 w-3 h-3 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 border-2 border-[#030712] shadow-[0_0_10px_rgba(34,211,238,0.5)]" />

                  <div className="glass glass-hover p-6">
                    <div className="flex flex-wrap gap-3 items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-white">{exp.role}</h3>
                        <p className="text-cyan-400 text-sm font-medium">{exp.company}</p>
                      </div>
                      {exp.current && (
                        <span className="px-2.5 py-1 rounded-full bg-green-400/10 text-green-400 text-[11px] mono border border-green-400/20">
                          ● Current
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-4 text-xs text-gray-500 mono mb-4">
                      <span className="flex items-center gap-1">
                        <FiCalendar size={12} />
                        {formatDate(exp.start_date)} — {exp.current ? 'Present' : exp.end_date ? formatDate(exp.end_date) : ''}
                      </span>
                      {exp.location && (
                        <span className="flex items-center gap-1">
                          <FiMapPin size={12} />
                          {exp.location}
                        </span>
                      )}
                    </div>

                    <p className="text-gray-400 text-sm leading-relaxed mb-4">{exp.description}</p>

                    {exp.tech_stack && exp.tech_stack.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {exp.tech_stack.map((tech) => (
                          <span key={tech} className="tech-tag">{tech}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
