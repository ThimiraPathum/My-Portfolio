import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiGithub, FiExternalLink, FiFilter } from 'react-icons/fi';
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

const categoryLabels: Record<string, string> = {
  All: 'All',
  web: 'Web',
  iot: 'IoT',
  design: 'System Design',
  research: 'Research',
};

const stripMarkdown = (text: string): string => {
  return text
    .replace(/#{1,6}\s+/g, '')        // remove ## headings
    .replace(/\*\*(.*?)\*\*/g, '$1')  // remove **bold**
    .replace(/\*(.*?)\*/g, '$1')      // remove *italic*
    .replace(/`{3}[\s\S]*?`{3}/g, '') // remove code blocks
    .replace(/`([^`]+)`/g, '$1')      // remove inline code
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // remove [links](url)
    .replace(/^[-*+]\s+/gm, '')       // remove list bullets
    .replace(/^\d+\.\s+/gm, '')       // remove numbered lists
    .replace(/^>\s+/gm, '')           // remove blockquotes
    .replace(/---/g, '')              // remove dividers
    .replace(/\n{2,}/g, ' ')          // collapse newlines to space
    .trim();
};

export default function Projects() {
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
  const filtered = filter === 'All' ? projects : projects.filter((p) => p.category === filter);

  return (
    <section className="pt-24 pb-20 px-4 sm:px-6 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Heading */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <div className="mono text-xs mb-3 tracking-widest" style={{ color: 'var(--accent-primary)' }}>{'>'} projects.load()</div>
          <h1 className="section-heading mb-4">
            My <span className="gradient-text">Projects</span>
          </h1>
          <div className="h-px w-24 rounded-full mb-8" style={{ background: 'linear-gradient(to right, var(--accent-secondary), var(--accent-primary))' }} />

          {/* Filter tabs */}
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className="px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all duration-200 flex items-center gap-1.5"
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
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="glass h-64 animate-pulse" />
            ))}
          </div>
        ) : (
          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AnimatePresence>
              {filtered.map((project, i) => (
                <motion.div
                  key={project.id}
                  layout
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.08 }}
                  className="glass glass-hover p-0 group flex flex-col overflow-hidden"
                  style={{ border: '1px solid rgba(232, 116, 29, 0.12)' }}
                >
                  <NavLink to={`/project/${project.id}`} className="flex-1 flex flex-col">
                    {/* Project Image */}
                    {(project.image_url || (project.gallery && project.gallery.length > 0)) && (
                      <div className="w-full h-48 overflow-hidden relative" style={{ borderBottom: '1px solid var(--border)' }}>
                        <img 
                          src={getSafeUrl(project.image_url || project.gallery![0])} 
                          alt={project.title} 
                          className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                          style={{ borderRadius: '12px 12px 0 0' }}
                        />
                        {/* Warm gradient overlay on hover */}
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                          style={{ background: 'linear-gradient(to top, rgba(212, 175, 55, 0.08), transparent)' }}
                        />
                      </div>
                    )}
                    
                    <div className="p-6 flex-1 flex flex-col">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1 min-w-0 pr-3">
                          <div className="flex flex-wrap gap-2 mb-2">
                            {project.featured && (
                              <span className="mono text-[10px] px-2 py-0.5 rounded"
                                style={{ color: 'var(--accent-secondary)', background: 'rgba(212, 175, 55, 0.1)', border: '1px solid rgba(212, 175, 55, 0.2)' }}>
                                ★ Featured
                              </span>
                            )}
                            {project.coming_soon && (
                              <span className="mono text-[10px] px-2 py-0.5 rounded"
                                style={{ color: 'var(--accent-amber)', background: 'rgba(255, 165, 0, 0.1)', border: '1px solid rgba(255, 165, 0, 0.2)' }}>
                                In Progress
                              </span>
                            )}
                            <span className="mono text-[10px] capitalize px-2 py-0.5 rounded"
                              style={{ color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
                              {categoryLabels[project.category] ?? project.category}
                            </span>
                          </div>
                          <h3 className="text-base font-semibold leading-snug transition-colors" style={{ color: 'var(--text-primary)' }}>
                            {project.title}
                          </h3>
                        </div>
                        <div onClick={(e) => e.preventDefault()} className="flex gap-2 flex-shrink-0 relative z-10">
                          {project.github_url && (
                            <a href={project.github_url} target="_blank" rel="noreferrer"
                              className="p-2 rounded-lg transition-all"
                              style={{ border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
                              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--accent-primary)'; e.currentTarget.style.borderColor = 'rgba(232, 116, 29, 0.3)'; }}
                              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
                            >
                              <FiGithub size={14} />
                            </a>
                          )}
                          {project.live_url && (
                            <a href={project.live_url} target="_blank" rel="noreferrer"
                              className="p-2 rounded-lg transition-all"
                              style={{ border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
                              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--accent-primary)'; e.currentTarget.style.borderColor = 'rgba(232, 116, 29, 0.3)'; }}
                              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
                            >
                              <FiExternalLink size={14} />
                            </a>
                          )}
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-sm leading-relaxed flex-1 mb-5 line-clamp-4" style={{ color: 'var(--text-secondary)' }}>
                        {stripMarkdown(project.description)}
                      </p>

                      {/* Tech / Skill tags */}
                      {project.tech_stack && project.tech_stack.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {project.tech_stack.map((tech) => (
                            <span key={tech} className="tech-tag">{tech}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </NavLink>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="text-center py-20 mono text-sm" style={{ color: 'var(--text-secondary)' }}>
            No projects in this category yet, check back soon!
          </div>
        )}
      </div>
    </section>
  );
}
