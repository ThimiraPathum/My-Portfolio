import LoadError from './LoadError';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { NavLink } from 'react-router-dom';
import { FiArrowRight, FiClock } from 'react-icons/fi';
import { getBlogs, getSafeUrl } from '../api';

interface Blog {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  cover_image: string | null;
  status: string;
  coming_soon: boolean;
  published_at: string | null;
  created_at: string;
}

export default function RecentBlogs() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const retry = () => {
    setError(false);
    setLoading(true);
    setAttempt(value => value + 1);
  };

  useEffect(() => {
    getBlogs()
      .then(({ data }) => {
        if (Array.isArray(data)) {
          setBlogs(data.slice(0, 3));
        }
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [attempt]);

  return (
    <section id="blog-preview-section" aria-busy={loading} className="py-20 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Section Heading — Shares exact max-w-6xl container with zero extra offsets */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }} 
          whileInView={{ opacity: 1, y: 0 }} 
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <div className="mono text-xs mb-3 tracking-widest" style={{ color: 'var(--accent-primary)' }}>{'>'} blog.recent()</div>
          <h2 className="section-heading mb-4">
            Recent <span className="gradient-text">Thoughts</span>
          </h2>
          <div className="h-px w-24 rounded-full" style={{ background: 'linear-gradient(to right, var(--accent-secondary), var(--accent-primary))' }} />
        </motion.div>

        {!loading && !error && blogs.length === 0 && <p className="py-8 text-sm text-stone-600">Articles will appear here when published.</p>}

        {error ? <LoadError subject="articles" onRetry={retry} /> : loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="glass h-96 animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : (
          <div>
            {/* 3-Column Desktop Grid — First card left edge aligns perfectly with section heading */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-12">
              {blogs.map((blog, i) => {
                const displayDate = blog.published_at || blog.created_at;

                return (
                  <motion.div
                    key={blog.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-30px' }}
                    transition={{ delay: i * 0.1, duration: 0.5 }}
                    className="flex flex-col"
                  >
                    {blog.coming_soon ? (
                      <div className="glass p-6 opacity-70 rounded-2xl flex-1 flex flex-col justify-between" style={{ borderStyle: 'dashed' }}>
                        <div>
                          <div className="flex items-center gap-2 mb-2" style={{ color: 'var(--accent-amber)' }}>
                            <FiClock size={14} />
                            <span className="mono text-[10px] uppercase tracking-wider">Coming Soon</span>
                          </div>
                          <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>{blog.title}</h3>
                          <p className="text-xs line-clamp-3" style={{ color: 'var(--text-secondary)' }}>{blog.excerpt}</p>
                        </div>
                      </div>
                    ) : (
                      <NavLink to={`/blog/${blog.slug}`} className="flex-1 flex flex-col group">
                        <div className="glass glass-hover flex flex-col justify-between flex-1 overflow-hidden relative rounded-2xl border transition-all duration-300" style={{ borderColor: 'rgba(232, 116, 29, 0.15)' }}>
                          {/* Full-width Image at Top — flush with card outer border */}
                          {blog.cover_image && (
                            <div className="w-full aspect-[16/9] overflow-hidden" style={{ borderBottom: '1px solid var(--border)' }}>
                              <img
                                src={getSafeUrl(blog.cover_image)}
                                alt={blog.title}
                                className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                              />
                            </div>
                          )}

                          {/* Card Content Area below Image */}
                          <div className="p-6 flex flex-col justify-between flex-1">
                            <div>
                              <div className="mono text-xs mb-2.5 flex items-center gap-2" style={{ color: 'var(--accent-secondary)' }}>
                                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                                {displayDate ? new Date(displayDate).toLocaleDateString('en-US', {
                                  month: 'short', day: 'numeric', year: 'numeric'
                                }) : 'Recently Published'}
                              </div>
                              <h3 className="text-xl font-bold mb-3 leading-snug transition-colors line-clamp-2" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
                                {blog.title}
                              </h3>
                              <p className="text-sm leading-relaxed mb-6 line-clamp-3" style={{ color: 'var(--text-secondary)' }}>
                                {blog.excerpt}
                              </p>
                            </div>

                            <div className="flex items-center gap-2 text-sm font-semibold group-hover:translate-x-1 transition-transform pt-2" style={{ color: 'var(--accent-primary)' }}>
                              Read Post <FiArrowRight size={14} />
                            </div>
                          </div>
                        </div>
                      </NavLink>
                    )}
                  </motion.div>
                );
              })}
            </div>

            {/* View All Articles Button */}
            <div className="text-center">
              <NavLink 
                to="/blog" 
                className="btn-gradient px-8 py-3.5 rounded-xl inline-flex items-center gap-2 text-sm font-semibold shadow-warm-md hover:scale-105 transition-all"
              >
                View All Articles <FiArrowRight size={16} />
              </NavLink>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
