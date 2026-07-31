import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiGithub, FiExternalLink, FiFilter, FiArrowRight, FiCode } from 'react-icons/fi';
import { NavLink } from 'react-router-dom';
import { getProjects, getSafeUrl } from '../api';

interface Project {
  id: number;
  title: string;
  description: string;
  image_url: string | null;
  gallery: string[] | null;
  video_url: string | null;
  tech_stack: string[];
  github_url: string | null;
  live_url: string | null;
  category: string;
  featured: boolean;
  coming_soon: boolean;
}

interface ProjectsProps {
  limit?: number;
}

const categoryLabels: Record<string, string> = {
  All: 'All',
  web: 'Web',
  iot: 'IoT',
  design: 'System Design',
  research: 'Research',
};

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

export default function Projects({ limit }: ProjectsProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProjects()
      .then(({ data }) => setProjects(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const categories = ['All', ...Array.from(new Set(projects.map((p) => p.category)))];
  
  let displayedProjects = filter === 'All' ? projects : projects.filter((p) => p.category === filter);
  if (limit && limit > 0) {
    displayedProjects = displayedProjects.slice(0, limit);
  }

  return (
    <section id="projects-section" className="pt-24 pb-20 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Heading */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <div className="mono text-xs mb-3 tracking-widest" style={{ color: 'var(--accent-primary)' }}>{'>'} projects.load()</div>
          <h2 className="section-heading mb-4">
            Featured <span className="gradient-text">Projects</span>
          </h2>
          <div className="h-px w-24 rounded-full mb-8" style={{ background: 'linear-gradient(to right, var(--accent-secondary), var(--accent-primary))' }} />

          {/* Filter tabs — rendered only when not limited */}
          {!limit && (
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className="px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all duration-200 flex items-center gap-1.5 cursor-pointer"
                  style={{
                    background: filter === cat ? 'rgba(232, 116, 29, 0.1)' : 'transparent',
                    color: filter === cat ? 'var(--accent-primary)' : 'var(--text-secondary)',
                    border: `1px solid ${filter === cat ? 'rgba(232, 116, 29, 0.3)' : 'var(--border)'}`,
                  }}
                >
                  {cat === 'All' && <FiFilter size={12} />}
                  {categoryLabels[cat] ?? cat}
                </button>
              ))}
            </div>
          )}
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[...Array(limit || 4)].map((_, i) => (
              <div key={i} className="glass h-80 animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : (
          <div>
            <motion.div layout className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <AnimatePresence>
                {displayedProjects.map((project, i) => {
                  const coverImage = project.image_url || (project.gallery && project.gallery.length > 0 ? project.gallery[0] : null);

                  return (
                    <motion.div
                      key={project.id}
                      layout
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      whileHover={{ y: -6 }}
                      transition={{ delay: i * 0.08, duration: 0.4 }}
                      className="glass glass-hover p-0 group flex flex-col overflow-hidden rounded-2xl relative border"
                      style={{ borderColor: 'rgba(232, 116, 29, 0.15)' }}
                    >
                      {/* Project Image Placeholder / Thumbnail */}
                      <NavLink to={`/project/${project.id}`} className="block relative w-full h-52 overflow-hidden bg-black/5" style={{ borderBottom: '1px solid var(--border)' }}>
                        {coverImage ? (
                          <img 
                            src={getSafeUrl(coverImage)} 
                            alt={project.title} 
                            className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-stone-400"
                            style={{ background: 'linear-gradient(135deg, rgba(232, 116, 29, 0.05), rgba(212, 175, 55, 0.05))' }}>
                            <FiCode size={32} style={{ color: 'var(--accent-primary)' }} />
                            <span className="mono text-xs uppercase tracking-wider">{project.category} Project</span>
                          </div>
                        )}

                        {/* Warm gradient overlay */}
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                          style={{ background: 'linear-gradient(to top, rgba(26, 20, 16, 0.4), transparent)' }}
                        />

                        {/* Category & Status Badges */}
                        <div className="absolute top-3 left-3 flex flex-wrap gap-2 pointer-events-none">
                          {project.featured && (
                            <span className="mono text-[10px] px-2.5 py-1 rounded-full font-semibold backdrop-blur-md"
                              style={{ color: '#D4AF37', background: 'rgba(26, 20, 16, 0.75)', border: '1px solid rgba(212, 175, 55, 0.4)' }}>
                              ★ Featured
                            </span>
                          )}
                          {project.coming_soon && (
                            <span className="mono text-[10px] px-2.5 py-1 rounded-full font-semibold backdrop-blur-md"
                              style={{ color: '#FFA500', background: 'rgba(26, 20, 16, 0.75)', border: '1px solid rgba(255, 165, 0, 0.4)' }}>
                              In Progress
                            </span>
                          )}
                        </div>
                      </NavLink>

                      {/* Card Body */}
                      <div className="p-6 flex-1 flex flex-col justify-between">
                        <div>
                          {/* Title */}
                          <NavLink to={`/project/${project.id}`}>
                            <h3 className="text-xl font-bold mb-2.5 leading-snug transition-colors group-hover:text-[var(--accent-primary)]" 
                              style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
                              {project.title}
                            </h3>
                          </NavLink>

                          {/* Description */}
                          <p className="text-sm leading-relaxed mb-5 line-clamp-3" style={{ color: 'var(--text-secondary)' }}>
                            {stripMarkdown(project.description)}
                          </p>

                          {/* Tech Stack Tags */}
                          {project.tech_stack && project.tech_stack.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-6">
                              {project.tech_stack.map((tech) => (
                                <span key={tech} className="tech-tag">{tech}</span>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Action Buttons: View Live & GitHub */}
                        <div className="flex items-center justify-between pt-4 border-t border-[var(--border)]">
                          <NavLink
                            to={`/project/${project.id}`}
                            className="text-xs font-semibold mono inline-flex items-center gap-1.5 transition-all"
                            style={{ color: 'var(--accent-primary)' }}
                          >
                            Details <FiArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
                          </NavLink>

                          <div className="flex items-center gap-2">
                            {project.github_url && (
                              <a
                                href={project.github_url}
                                target="_blank"
                                rel="noreferrer"
                                className="px-3 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-all border group/btn"
                                style={{
                                  borderColor: 'var(--border)',
                                  color: 'var(--text-secondary)',
                                  background: 'transparent',
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.color = 'var(--accent-primary)';
                                  e.currentTarget.style.borderColor = 'rgba(232, 116, 29, 0.4)';
                                  e.currentTarget.style.background = 'rgba(232, 116, 29, 0.05)';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.color = 'var(--text-secondary)';
                                  e.currentTarget.style.borderColor = 'var(--border)';
                                  e.currentTarget.style.background = 'transparent';
                                }}
                              >
                                <FiGithub size={13} />
                                <span>GitHub</span>
                              </a>
                            )}
                            {project.live_url && (
                              <a
                                href={project.live_url}
                                target="_blank"
                                rel="noreferrer"
                                className="btn-gradient px-3 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 shadow-warm-xs hover:scale-105 transition-all"
                              >
                                <span>View Live</span>
                                <FiExternalLink size={13} />
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </motion.div>

            {/* Prominent Centered "View All Projects" Button (rendered when limited to 2) */}
            {limit && projects.length > limit && (
              <div className="text-center mt-12">
                <NavLink
                  to="/projects"
                  className="btn-gradient px-8 py-3.5 rounded-xl inline-flex items-center gap-2 text-sm font-semibold shadow-warm-md hover:scale-105 transition-all"
                >
                  View All Projects <FiArrowRight size={16} />
                </NavLink>
              </div>
            )}
          </div>
        )}

        {!loading && displayedProjects.length === 0 && (
          <div className="text-left py-16 mono text-sm" style={{ color: 'var(--text-secondary)' }}>
            No projects found in category "{filter}".
          </div>
        )}
      </div>
    </section>
  );
}
