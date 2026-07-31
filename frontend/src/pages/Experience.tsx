import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMapPin, FiCalendar, FiMessageSquare, FiX, FiExternalLink } from 'react-icons/fi';
import { getExperiences, getSafeUrl } from '../api';
import MarkdownRenderer from "../components/MarkdownRenderer";

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

const stripMarkdown = (text: string): string => {
  return text
    .replace(/#{1,6}\s+/g, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/`{3}[\s\S]*?`{3}/g, '')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/^[-*+]\s+/gm, '')
    .replace(/^\d+\.\s+/gm, '')
    .replace(/^>\s+/gm, '')
    .replace(/---/g, '')
    .replace(/\n{2,}/g, ' ')
    .trim();
};

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
    <section className="pt-24 pb-20 px-4 sm:px-6 min-h-screen">
      <div className="max-w-4xl mx-auto">
        {/* Heading */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <div className="mono text-xs mb-3 tracking-widest" style={{ color: 'var(--accent-primary)' }}>{'>'} education.timeline()</div>
          <h1 className="section-heading mb-4">
            Education &amp; <span className="gradient-text">Certifications</span>
          </h1>
          <div className="h-px w-24 rounded-full" style={{ background: 'linear-gradient(to right, var(--accent-secondary), var(--accent-primary))' }} />
        </motion.div>

        {loading ? (
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="glass h-40 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="relative">
            {/* Timeline center line — gold to orange gradient */}
            <div className="absolute left-6 top-4 bottom-4 w-px"
              style={{ background: 'linear-gradient(180deg, var(--accent-secondary), var(--accent-primary), transparent)' }}
            />

            <div className="space-y-6 pl-16">
              {experiences.map((exp, i) => (
                <motion.div
                  key={exp.id}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.15, duration: 0.5 }}
                  className="relative"
                >
                  {/* Timeline dot — gold/orange gradient */}
                  <div className="absolute -left-[42px] top-5 w-3 h-3 rounded-full"
                    style={{
                      background: 'linear-gradient(135deg, var(--accent-secondary), var(--accent-primary))',
                      border: '2px solid var(--bg-primary)',
                      boxShadow: '0 0 10px rgba(232, 116, 29, 0.4)',
                    }}
                  />

                  <div className="glass glass-hover p-6">
                    <div className="flex flex-wrap gap-3 items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>{exp.role}</h3>
                        <p className="text-sm font-medium" style={{ color: 'var(--accent-primary)' }}>{exp.company}</p>
                      </div>
                      {exp.current && (
                        <span className="px-2.5 py-1 rounded-full text-[11px] mono"
                          style={{ background: 'rgba(107, 165, 118, 0.1)', color: 'var(--success)', border: '1px solid rgba(107, 165, 118, 0.2)' }}>
                          ● Current
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-4 text-xs mono mb-4" style={{ color: 'var(--text-secondary)' }}>
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
                      {expandedId !== exp.id ? (
                        // Collapsed — plain stripped text with clamp
                        <p
                          className="text-sm leading-relaxed line-clamp-3"
                          style={{ color: 'var(--text-secondary)' }}
                        >
                          {stripMarkdown(exp.description)}
                        </p>
                      ) : (
                        // Expanded — full markdown rendering
                        <MarkdownRenderer content={exp.description} />
                      )}
                      {exp.description.length > 150 && (
                        <button 
                          onClick={() => setExpandedId(expandedId === exp.id ? null : exp.id)}
                          className="text-[10px] mono mt-1 transition-colors uppercase tracking-widest"
                          style={{ color: 'var(--accent-primary)' }}
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
                      <div className="mt-6 pt-5" style={{ borderTop: '1px solid var(--border)' }}>
                        <div className="flex flex-col gap-4 items-center">
                          <label className="text-[10px] mono uppercase tracking-widest flex items-center justify-center gap-2 w-full" style={{ color: 'var(--text-secondary)' }}>
                            <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--accent-secondary)', boxShadow: '0 0 5px rgba(212, 175, 55, 0.5)' }} />
                            Credentials & Proof
                          </label>
                          
                          {(() => {
                            const fullUrl = getSafeUrl(exp.certificate_url);
                            const isPdf = exp.certificate_url.toLowerCase().endsWith('.pdf');
                            
                            return isPdf ? (
                              <button 
                                onClick={() => setSelectedCert({ url: fullUrl, title: exp.role || exp.company, isPdf: true })}
                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all group cursor-pointer"
                                style={{
                                  background: 'linear-gradient(135deg, rgba(232, 116, 29, 0.08), rgba(212, 175, 55, 0.08))',
                                  color: 'var(--accent-primary)',
                                  border: '1px solid rgba(232, 116, 29, 0.2)',
                                }}
                              >
                                <FiMessageSquare size={16} className="group-hover:scale-110 transition-transform" /> 
                                View Certification PDF
                              </button>
                            ) : (
                              <div 
                                className="relative group max-w-sm cursor-pointer overflow-hidden transition-all"
                                style={{ borderRadius: '12px', border: '1px solid var(--border)' }}
                                onClick={() => setSelectedCert({ url: fullUrl, title: exp.role || exp.company, isPdf: false })}
                              >
                                <img 
                                  src={fullUrl} 
                                  className="w-full h-auto object-cover group-hover:scale-[1.03] transition-transform duration-500" 
                                  alt="Certification"
                                />
                                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                                  style={{ background: 'rgba(26, 20, 16, 0.4)' }}>
                                  <span className="px-4 py-2 rounded-full text-[10px] mono uppercase"
                                    style={{ background: 'rgba(250, 244, 239, 0.15)', backdropFilter: 'blur(8px)', color: 'var(--bg-primary)', border: '1px solid rgba(250, 244, 239, 0.2)' }}>
                                    Expand View
                                  </span>
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
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8"
            style={{ background: 'rgba(26, 20, 16, 0.85)', backdropFilter: 'blur(4px)' }}
            onClick={() => setSelectedCert(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-5xl max-h-full glass overflow-hidden flex flex-col"
              style={{ boxShadow: 'var(--shadow-lg)' }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-4" style={{ borderBottom: '1px solid var(--border)', background: 'rgba(232, 116, 29, 0.03)' }}>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full" style={{ background: 'var(--accent-secondary)', boxShadow: '0 0 8px rgba(212, 175, 55, 0.5)' }} />
                  <h2 className="font-semibold text-sm sm:text-base" style={{ color: 'var(--text-primary)' }}>{selectedCert.title}</h2>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => window.open(selectedCert.url, '_blank')}
                    className="p-2 transition-colors"
                    style={{ color: 'var(--text-secondary)' }}
                    title="Open in new tab"
                  >
                    <FiExternalLink size={20} />
                  </button>
                  <button 
                    onClick={() => setSelectedCert(null)}
                    className="p-2 transition-colors"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    <FiX size={24} />
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-auto p-4 flex items-center justify-center" style={{ background: 'rgba(230, 215, 195, 0.3)' }}>
                {selectedCert.isPdf ? (
                  <iframe 
                    src={`${selectedCert.url}#toolbar=0`} 
                    className="w-full aspect-[1/1.41] max-h-[70vh] rounded-lg"
                    style={{ border: '1px solid var(--border)', boxShadow: 'var(--shadow-lg)' }}
                    title="Certificate PDF"
                  />
                ) : (
                  <img 
                    src={selectedCert.url} 
                    className="max-w-full max-h-[75vh] object-contain rounded-lg" 
                    style={{ boxShadow: 'var(--shadow-lg)' }}
                    alt="Certificate Detail"
                  />
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-4 text-center" style={{ background: 'rgba(232, 116, 29, 0.03)', borderTop: '1px solid var(--border)' }}>
                <p className="text-[10px] mono uppercase tracking-[0.2em]" style={{ color: 'var(--text-secondary)' }}>Verified Certification & Professional Credential</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
