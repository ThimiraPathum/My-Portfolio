import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { NavLink } from 'react-router-dom';
import { FiArrowRight, FiClock, FiAlertCircle } from 'react-icons/fi';
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

  return (
    <main className="pt-24 pb-20 px-4 sm:px-6 min-h-screen grid-bg">
      <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl pointer-events-none" style={{ background: 'rgba(232, 116, 29, 0.04)' }} />

      <div className="max-w-4xl mx-auto relative z-10">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <div className="mono text-xs mb-3 tracking-widest" style={{ color: 'var(--accent-primary)' }}>{'>'} blog.read()</div>
          <h1 className="section-heading mb-4">
            My <span className="gradient-text">Thoughts</span>
          </h1>
          <div className="h-px w-24 rounded-full" style={{ background: 'linear-gradient(to right, var(--accent-secondary), var(--accent-primary))' }} />
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
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="glass h-48 animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {blogs.map((blog, i) => {
              const displayDate = blog.published_at || blog.created_at;

              return (
                <motion.div
                  key={blog.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                >
                  {blog.coming_soon ? (
                    // Coming Soon Card
                    <div className="glass p-6 opacity-70 rounded-2xl" style={{ borderStyle: 'dashed' }}>
                      <div className="flex items-center gap-2 mb-2" style={{ color: 'var(--accent-amber)' }}>
                        <FiClock size={14} />
                        <span className="mono text-[10px] uppercase tracking-wider">Coming Soon</span>
                      </div>
                      <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>{blog.title}</h2>
                      <p className="text-sm line-clamp-2" style={{ color: 'var(--text-secondary)' }}>{blog.excerpt}</p>
                    </div>
                  ) : (
                    // Published Post Card
                    <NavLink to={`/blog/${blog.slug}`} className="block group">
                      <div className="glass glass-hover p-6 md:p-8 flex flex-col md:flex-row gap-6 items-center overflow-hidden relative rounded-2xl">
                        {blog.cover_image && (
                          <div className="w-full md:w-48 h-32 flex-shrink-0 overflow-hidden" style={{ borderRadius: '12px', border: '1px solid var(--border)' }}>
                            <img
                              src={getSafeUrl(blog.cover_image)}
                              alt={blog.title}
                              className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                            />
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="mono text-xs mb-2 flex items-center gap-2" style={{ color: 'var(--accent-secondary)' }}>
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                            {displayDate ? new Date(displayDate).toLocaleDateString('en-US', {
                              month: 'long', day: 'numeric', year: 'numeric'
                            }) : 'Recently Published'}
                          </div>
                          <h2 className="text-2xl font-bold mb-3 transition-colors" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
                            {blog.title}
                          </h2>
                          <p className="text-sm leading-relaxed mb-4 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
                            {blog.excerpt}
                          </p>
                          <div className="flex items-center gap-2 text-sm font-semibold group-hover:translate-x-1 transition-transform" style={{ color: 'var(--accent-primary)' }}>
                            Read Post <FiArrowRight size={16} />
                          </div>
                        </div>
                      </div>
                    </NavLink>
                  )}
                </motion.div>
              );
            })}

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
