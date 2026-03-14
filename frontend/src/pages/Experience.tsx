import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMapPin, FiCalendar, FiMessageSquare, FiX, FiExternalLink } from 'react-icons/fi';
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
  certificate_url: string | null;
}

function formatDate(dateStr: string) {
  if (!dateStr || dateStr.includes('0000-00-00')) return '';
  try {
    const d = new Date(dateStr + 'T00:00:00');
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  } catch {
    return '';
  }
}

export default function Experience() {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [selectedCert, setSelectedCert] = useState<{ url: string; title: string; isPdf: boolean } | null>(null);

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
            Education &amp; <span className="gradient-text">Certifications</span>
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

                    <div className="relative group">
                      <p className={`text-gray-400 text-sm leading-relaxed ${expandedId !== exp.id ? 'line-clamp-3' : ''}`}>
                        {exp.description}
                      </p>
                      {exp.description.length > 150 && (
                        <button 
                          onClick={() => setExpandedId(expandedId === exp.id ? null : exp.id)}
                          className="text-cyan-400 text-[10px] mono mt-1 hover:text-cyan-300 transition-colors uppercase tracking-widest"
                        >
                          {expandedId === exp.id ? '— Show Less' : '+ View More'}
                        </button>
                      )}
                    </div>

                    {exp.tech_stack && exp.tech_stack.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {exp.tech_stack
                          .filter(tech => !tech.toLowerCase().includes('studying') && !tech.toLowerCase().includes('active'))
                          .map((tech) => (
                          <span key={tech} className="tech-tag">{tech}</span>
                        ))}
                      </div>
                    )}

                    {exp.certificate_url && (
                      <div className="mt-6 pt-5 border-t border-white/5">
                        <div className="flex flex-col gap-4 items-center">
                          <label className="text-[10px] text-gray-500 mono uppercase tracking-widest flex items-center justify-center gap-2 w-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_5px_rgba(34,211,238,0.5)]" />
                            Credentials & Proof
                          </label>
                          
                          {(() => {
                            const fullUrl = exp.certificate_url.startsWith('http') 
                              ? exp.certificate_url 
                              : `http://localhost:8000${exp.certificate_url.startsWith('/') ? '' : '/'}${exp.certificate_url}`;
                            const isPdf = exp.certificate_url.toLowerCase().endsWith('.pdf');
                            
                            return isPdf ? (
                              <button 
                                onClick={() => setSelectedCert({ url: fullUrl, title: exp.role || exp.company, isPdf: true })}
                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-500/10 to-orange-500/10 text-red-400 text-xs font-bold hover:brightness-125 transition-all border border-red-500/20 group cursor-pointer"
                              >
                                <FiMessageSquare size={16} className="group-hover:scale-110 transition-transform" /> 
                                View Certification PDF
                              </button>
                            ) : (
                              <div 
                                className="relative group max-w-sm cursor-pointer overflow-hidden rounded-xl border border-white/10 hover:border-cyan-400/30 transition-all shadow-xl"
                                onClick={() => setSelectedCert({ url: fullUrl, title: exp.role || exp.company, isPdf: false })}
                              >
                                <img 
                                  src={fullUrl} 
                                  className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500" 
                                  alt="Certification"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                  <span className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-full text-white text-[10px] mono uppercase border border-white/20">Expand View</span>
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Certificate Lightbox */}
      <AnimatePresence>
        {selectedCert && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 bg-[#030712]/90 backdrop-blur-sm"
            onClick={() => setSelectedCert(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-5xl max-h-full glass border-white/10 overflow-hidden flex flex-col shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-4 border-b border-white/5 bg-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.5)]" />
                  <h2 className="text-white font-semibold text-sm sm:text-base">{selectedCert.title}</h2>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => window.open(selectedCert.url, '_blank')}
                    className="p-2 text-gray-400 hover:text-cyan-400 transition-colors"
                    title="Open in new tab"
                  >
                    <FiExternalLink size={20} />
                  </button>
                  <button 
                    onClick={() => setSelectedCert(null)}
                    className="p-2 text-gray-400 hover:text-white transition-colors"
                  >
                    <FiX size={24} />
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-black/20">
                {selectedCert.isPdf ? (
                  <iframe 
                    src={`${selectedCert.url}#toolbar=0`} 
                    className="w-full aspect-[1/1.41] max-h-[70vh] rounded-lg border border-white/5 shadow-2xl"
                    title="Certificate PDF"
                  />
                ) : (
                  <img 
                    src={selectedCert.url} 
                    className="max-w-full max-h-[75vh] object-contain rounded-lg shadow-2xl" 
                    alt="Certificate Detail"
                  />
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-4 bg-white/5 border-t border-white/5 text-center">
                <p className="text-[10px] text-gray-500 mono uppercase tracking-[0.2em]">Verified Certification & Professional Credential</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
