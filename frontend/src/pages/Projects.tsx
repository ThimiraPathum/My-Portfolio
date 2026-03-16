import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiGithub, FiExternalLink, FiFilter } from 'react-icons/fi';
import { NavLink } from 'react-router-dom';
import { getProjects, BASE_URL } from '../api';

// Helper to ensure URLs are absolute and don't double-prepend BASE_URL
// Map from api/index.ts or defined locally if not exported
const getSafeUrl = (url: string | null) => {
    if (!url) return '';
    let sUrl = url;
    if (sUrl.includes('api.thimiradev.me')) sUrl = sUrl.split('api.thimiradev.me').pop() || '';
    if (sUrl.startsWith('http')) return sUrl;
    let cleanPath = sUrl.replace(/^\/+/, '');
    if (cleanPath.startsWith('api/')) cleanPath = cleanPath.replace(/^api\//, '');
    return `${BASE_URL.replace(/\/$/, '')}/${cleanPath}`;
};

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
    <main className="pt-24 pb-20 px-4 sm:px-6 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Heading */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <div className="mono text-xs text-cyan-400 mb-3 tracking-widest">{'>'} projects.load()</div>
          <h1 className="section-heading mb-4">
            My <span className="gradient-text">Projects</span>
          </h1>
          <div className="h-px w-24 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full mb-8" />

          {/* Filter tabs */}
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all duration-200 flex items-center gap-1.5 ${
                  filter === cat
                    ? 'bg-cyan-400/15 text-cyan-400 border border-cyan-400/30'
                    : 'border border-white/10 text-gray-400 hover:border-white/20 hover:text-white'
                }`}
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
                >
                  <NavLink to={`/project/${project.id}`} className="flex-1 flex flex-col">
                    {/* Project Image — show main image OR first gallery image as fallback */}
                    {(project.image_url || (project.gallery && project.gallery.length > 0)) && (
                      <div className="w-full h-48 border-b border-white/5 overflow-hidden bg-black/50">
                        <img 
                          src={getSafeUrl(project.image_url || project.gallery![0])} 
                          alt={project.title} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    )}
                    
                    <div className="p-6 flex-1 flex flex-col">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1 min-w-0 pr-3">
                          <div className="flex flex-wrap gap-2 mb-2">
                            {project.featured && (
                              <span className="mono text-[10px] text-yellow-400 bg-yellow-400/10 border border-yellow-400/20 px-2 py-0.5 rounded">
                                ★ Featured
                              </span>
                            )}
                            {project.coming_soon && (
                              <span className="mono text-[10px] text-orange-400 bg-orange-400/10 border border-orange-400/20 px-2 py-0.5 rounded">
                                Coming Soon
                              </span>
                            )}
                            <span className="mono text-[10px] text-gray-600 capitalize border border-white/5 px-2 py-0.5 rounded">
                              {categoryLabels[project.category] ?? project.category}
                            </span>
                          </div>
                          <h3 className="text-base font-semibold text-white group-hover:text-cyan-400 transition-colors leading-snug">
                            {project.title}
                          </h3>
                        </div>
                        <div onClick={(e) => e.preventDefault()} className="flex gap-2 flex-shrink-0 relative z-10">
                          {project.github_url && (
                            <a href={project.github_url} target="_blank" rel="noreferrer"
                              className="p-2 rounded-lg border border-white/5 text-gray-500 hover:text-cyan-400 hover:border-cyan-400/20 transition-all">
                              <FiGithub size={14} />
                            </a>
                          )}
                          {project.live_url && (
                            <a href={project.live_url} target="_blank" rel="noreferrer"
                              className="p-2 rounded-lg border border-white/5 text-gray-500 hover:text-cyan-400 hover:border-cyan-400/20 transition-all">
                              <FiExternalLink size={14} />
                            </a>
                          )}
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-gray-400 text-sm leading-relaxed flex-1 mb-5 line-clamp-4">
                        {project.description}
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
          <div className="text-center py-20 text-gray-600 mono text-sm">
            No projects in this category.
          </div>
        )}
      </div>
    </main>
  );
}
