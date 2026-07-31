import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { NavLink } from 'react-router-dom';
import { FiArrowRight, FiClock, FiAlertCircle, FiChevronDown } from 'react-icons/fi';
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

export default function BlogList() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState<number>(6);

  const fetchBlogs = () => {
    setLoading(true);
    setError(null);
    getBlogs()
      .then(({ data }) => {
        if (Array.isArray(data)) {
          setBlogs(data);
        } else {
          setBlogs([]);
        }
      })
      .catch((err) => {
        console.error('Failed to load blog posts:', err);
        setError('Failed to fetch blog posts. Please check your backend connection.');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const visibleBlogs = blogs.slice(0, visibleCount);

  return (
    <main className="pt-24 pb-20 px-4 sm:px-6 min-h-screen grid-bg">
      <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl pointer-events-none" style={{ background: 'rgba(232, 116, 29, 0.04)' }} />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Page Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <div className="mono text-xs mb-3 tracking-widest" style={{ color: 'var(--accent-primary)' }}>{'>'} blog.read_all()</div>
          <h1 className="section-heading mb-4">
            All <span className="gradient-text">Articles</span>
          </h1>
          <div className="h-px w-24 rounded-full mb-3" style={{ background: 'linear-gradient(to right, var(--accent-secondary), var(--accent-primary))' }} />
          {!loading && blogs.length > 0 && (
            <p className="mono text-xs" style={{ color: 'var(--text-secondary)' }}>
              Showing {Math.min(visibleCount, blogs.length)} of {blogs.length} articles published
            </p>
          )}
        </motion.div>

        {error && (
          <div className="glass p-6 rounded-2xl border border-red-500/30 bg-red-500/10 text-red-300 flex items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <FiAlertCircle size={20} className="flex-shrink-0 text-red-400" />
              <p className="text-sm font-medium">{error}</p>
            </div>
            <button
              onClick={fetchBlogs}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-red-500/20 hover:bg-red-500/30 text-white transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="glass h-96 animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : (
          <div>
            {/* 3-Column Responsive Grid with Vertical Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-12">
              {visibleBlogs.map((blog, i) => {
                const displayDate = blog.published_at || blog.created_at;

                return (
                  <motion.div
                    key={blog.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: (i % 6) * 0.08 }}
                    className="flex"
                  >
                    {blog.coming_soon ? (
                      // Coming Soon Vertical Card
                      <div className="glass p-6 opacity-70 rounded-2xl flex-1 flex flex-col justify-between" style={{ borderStyle: 'dashed' }}>
                        <div>
                          <div className="flex items-center gap-2 mb-2" style={{ color: 'var(--accent-amber)' }}>
                            <FiClock size={14} />
                            <span className="mono text-[10px] uppercase tracking-wider">Coming Soon</span>
                          </div>
                          <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>{blog.title}</h2>
                          <p className="text-sm line-clamp-3" style={{ color: 'var(--text-secondary)' }}>{blog.excerpt}</p>
                        </div>
                      </div>
                    ) : (
                      // Published Post Vertical Card
                      <NavLink to={`/blog/${blog.slug}`} className="block group flex-1 flex flex-col">
                        <div className="glass glass-hover flex flex-col justify-between flex-1 overflow-hidden relative rounded-2xl border transition-all duration-300" style={{ borderColor: 'rgba(232, 116, 29, 0.15)' }}>
                          {/* Full-width Image at Top */}
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
                                  month: 'long', day: 'numeric', year: 'numeric'
                                }) : 'Recently Published'}
                              </div>
                              <h2 className="text-xl font-bold mb-3 leading-snug transition-colors line-clamp-2" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
                                {blog.title}
                              </h2>
                              <p className="text-sm leading-relaxed mb-6 line-clamp-3" style={{ color: 'var(--text-secondary)' }}>
                                {blog.excerpt}
                              </p>
                            </div>

                            <div className="flex items-center gap-2 text-sm font-semibold group-hover:translate-x-1 transition-transform pt-2" style={{ color: 'var(--accent-primary)' }}>
                              Read Post <FiArrowRight size={16} />
                            </div>
                          </div>
                        </div>
                      </NavLink>
                    )}
                  </motion.div>
                );
              })}
            </div>

            {/* Load More Button */}
            {!loading && visibleCount < blogs.length && (
              <div className="text-center pt-4">
                <button
                  onClick={() => setVisibleCount((prev) => prev + 6)}
                  className="px-6 py-3 rounded-xl text-sm font-bold uppercase tracking-wider inline-flex items-center gap-2 transition-all border group cursor-pointer"
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
                  <span>Load More Articles ({blogs.length - visibleCount} remaining)</span>
                  <FiChevronDown size={16} className="group-hover:translate-y-0.5 transition-transform" />
                </button>
              </div>
            )}

            {!loading && !error && blogs.length === 0 && (
              <div className="text-center py-20 mono text-sm" style={{ color: 'var(--text-secondary)' }}>
                No blog posts published yet, check back soon!
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
