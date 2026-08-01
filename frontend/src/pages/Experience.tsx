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
  credential_link?: string | null;
  credential_url?: string | null;
}

function formatDate(dateStr: string | null | undefined) {
  if (!dateStr || dateStr.includes('0000-00-00')) return '';
  try {
    const clean = dateStr.split('T')[0].split(' ')[0];
    const parts = clean.split('-');
    if (parts.length >= 2) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parts[2] ? parseInt(parts[2], 10) : 1;
      const d = new Date(year, month, day);
      if (!isNaN(d.getTime())) {
        return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      }
    }
    const directDate = new Date(dateStr);
    if (!isNaN(directDate.getTime())) {
      return directDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    }
    return '';
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
    <section id="experience-section" className="pt-24 pb-20 px-4 sm:px-6 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Section Heading */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <div className="mono text-xs mb-3 tracking-widest" style={{ color: 'var(--accent-primary)' }}>{'>'} qualifications.timeline()</div>
          <h2 className="section-heading mb-4">
            Education &amp; <span className="gradient-text">Qualifications</span>
          </h2>
          <div className="h-px w-24 rounded-full mb-6" style={{ background: 'linear-gradient(to right, var(--accent-secondary), var(--accent-primary))' }} />
          <p className="max-w-2xl text-sm sm:text-base leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            Academic degrees, certifications, and technical accomplishments tracked across my engineering journey.
          </p>
        </motion.div>

        {loading ? (
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="glass h-40 animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="relative">
            {/* Minimalist Vertical Timeline Connecting Line */}
            <div className="absolute left-6 top-4 bottom-4 w-px"
              style={{ background: 'linear-gradient(180deg, var(--accent-secondary), var(--accent-primary), transparent)' }}
            />

            {/* Timeline Item Nodes */}
            <div className="space-y-8 pl-14 sm:pl-16">
              {experiences.map((exp, i) => (
                <motion.div
                  key={exp.id}
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-30px' }}
                  transition={{ delay: i * 0.12, duration: 0.5 }}
                  className="relative"
                >
                  {/* Timeline Node Point (Glowing Dot) */}
                  <div className="absolute -left-[40px] sm:-left-[42px] top-6 w-3.5 h-3.5 rounded-full transition-transform hover:scale-125"
                    style={{
                      background: 'linear-gradient(135deg, var(--accent-secondary), var(--accent-primary))',
                      border: '2.5px solid var(--bg-primary)',
                      boxShadow: '0 0 12px rgba(232, 116, 29, 0.4)',
                    }}
                  />

                  {/* Timeline Qualification Card */}
                  <motion.div 
                    whileHover={{ y: -4 }}
                    transition={{ duration: 0.3 }}
                    className="glass glass-hover p-6 sm:p-7 rounded-2xl relative border"
                    style={{ borderColor: 'rgba(232, 116, 29, 0.15)' }}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                      
                      {/* Left Column: Qualification Details & Credentials */}
                      <div className={`flex flex-col justify-between ${exp.certificate_url ? 'md:col-span-7 lg:col-span-8' : 'md:col-span-12'}`}>
                        <div>
                          {/* Degree / Certificate Title & Institution */}
                          <div className="flex flex-wrap gap-3 items-start justify-between mb-3">
                            <div>
                              <h3 className="text-xl font-bold tracking-tight" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
                                {exp.role}
                              </h3>
                              <p className="text-sm font-semibold mt-0.5" style={{ color: 'var(--accent-primary)' }}>
                                {exp.company}
                              </p>
                            </div>
                            {exp.current && (
                              <span className="px-2.5 py-1 rounded-full text-[11px] mono font-medium"
                                style={{ background: 'rgba(107, 165, 118, 0.1)', color: 'var(--success)', border: '1px solid rgba(107, 165, 118, 0.2)' }}>
                                ● Current
                              </span>
                            )}
                          </div>

                          {/* Year / Dates & Location */}
                          <div className="flex flex-wrap gap-4 text-xs mono mb-4" style={{ color: 'var(--text-secondary)' }}>
                            {formatDate(exp.start_date) && (
                              <span className="flex items-center gap-1.5 font-medium">
                                <FiCalendar size={13} style={{ color: 'var(--accent-primary)' }} />
                                {formatDate(exp.start_date)} {exp.current ? '— Present' : exp.end_date && formatDate(exp.end_date) ? `— ${formatDate(exp.end_date)}` : ''}
                              </span>
                            )}
                            {exp.location && (
                              <span className="flex items-center gap-1.5">
                                <FiMapPin size={13} style={{ color: 'var(--accent-secondary)' }} />
                                {exp.location}
                              </span>
                            )}
                          </div>

                          {/* Description */}
                          <div className="relative group mb-4">
                            {expandedId !== exp.id ? (
                              <p className="text-sm leading-relaxed line-clamp-3" style={{ color: 'var(--text-secondary)' }}>
                                {stripMarkdown(exp.description)}
                              </p>
                            ) : (
                              <MarkdownRenderer content={exp.description} />
                            )}
                            {exp.description.length > 150 && (
                              <button 
                                onClick={() => setExpandedId(expandedId === exp.id ? null : exp.id)}
                                className="text-[10px] mono mt-1.5 transition-colors uppercase tracking-widest font-semibold cursor-pointer"
                                style={{ color: 'var(--accent-primary)' }}
                              >
                                {expandedId === exp.id ? '— Show Less' : '+ View More'}
                              </button>
                            )}
                          </div>

                          {/* Tech / Skill Tags */}
                          {exp.tech_stack && exp.tech_stack.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-4">
                              {exp.tech_stack
                                .filter(tech => !tech.toLowerCase().includes('studying') && !tech.toLowerCase().includes('active'))
                                .map((tech) => (
                                <span key={tech} className="tech-tag">{tech}</span>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Verify Credential Button */}
                        {(exp.credential_link || exp.credential_url) && (
                          <div className="pt-2 mt-2">
                            <a
                              href={exp.credential_link || exp.credential_url || '#'}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border group cursor-pointer"
                              style={{
                                borderColor: 'rgba(232, 116, 29, 0.35)',
                                color: 'var(--accent-primary)',
                                background: 'rgba(232, 116, 29, 0.05)',
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'rgba(232, 116, 29, 0.12)';
                                e.currentTarget.style.borderColor = 'var(--accent-primary)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'rgba(232, 116, 29, 0.05)';
                                e.currentTarget.style.borderColor = 'rgba(232, 116, 29, 0.35)';
                              }}
                            >
                              <span>Verify Credential</span>
                              <FiExternalLink size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                            </a>
                          </div>
                        )}
                      </div>

                      {/* Right Column: Certificate Image / PDF Proof */}
                      {exp.certificate_url && (
                        <div className="md:col-span-5 lg:col-span-4 w-full flex flex-col items-center justify-center pt-4 md:pt-0">
                          <div className="w-full flex flex-col items-center gap-2">
                            {(() => {
                              const fullUrl = getSafeUrl(exp.certificate_url);
                              const isPdf = exp.certificate_url.toLowerCase().endsWith('.pdf');
                              
                              return isPdf ? (
                                <button 
                                  onClick={() => setSelectedCert({ url: fullUrl, title: exp.role || exp.company, isPdf: true })}
                                  className="w-full py-6 px-4 rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-2 transition-all group cursor-pointer border"
                                  style={{
                                    background: 'linear-gradient(135deg, rgba(232, 116, 29, 0.06), rgba(212, 175, 55, 0.06))',
                                    color: 'var(--accent-primary)',
                                    borderColor: 'rgba(232, 116, 29, 0.25)',
                                  }}
                                >
                                  <FiMessageSquare size={24} className="group-hover:scale-110 transition-transform" /> 
                                  <span>View Certification PDF</span>
                                </button>
                              ) : (
                                <div 
                                  className="relative group w-full max-w-[280px] mx-auto cursor-pointer overflow-hidden rounded-xl border transition-all"
                                  style={{ borderColor: 'var(--border)' }}
                                  onClick={() => setSelectedCert({ url: fullUrl, title: exp.role || exp.company, isPdf: false })}
                                >
                                  <img 
                                    src={fullUrl} 
                                    className="w-full h-44 sm:h-48 object-cover group-hover:scale-[1.03] transition-transform duration-500 rounded-xl" 
                                    alt={exp.role || "Certification"}
                                  />
                                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                                    style={{ background: 'rgba(26, 20, 16, 0.5)', backdropFilter: 'blur(2px)' }}>
                                    <span className="px-3.5 py-1.5 rounded-full text-[10px] mono uppercase font-bold tracking-wider"
                                      style={{ background: 'rgba(250, 244, 239, 0.2)', color: '#FAF4EF', border: '1px solid rgba(250, 244, 239, 0.3)' }}>
                                      Expand Image
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
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Certificate Lightbox Modal */}
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
                    className="p-2 transition-colors cursor-pointer"
                    style={{ color: 'var(--text-secondary)' }}
                    title="Open in new tab"
                  >
                    <FiExternalLink size={20} />
                  </button>
                  <button 
                    onClick={() => setSelectedCert(null)}
                    className="p-2 transition-colors cursor-pointer"
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
