import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { NavLink } from 'react-router-dom';
import { FiArrowRight, FiClock } from 'react-icons/fi';
import { getBlogs, BASE_URL } from '../api';

interface Blog {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  cover_image: string | null;
  status: string;
  coming_soon: boolean;
  created_at: string;
}

export default function BlogList() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getBlogs()
      .then(({ data }) => setBlogs(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="pt-24 pb-20 px-4 sm:px-6 min-h-screen grid-bg">
      <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full bg-purple-500/5 blur-3xl pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <div className="mono text-xs text-cyan-400 mb-3 tracking-widest">{'>'} blog.read()</div>
          <h1 className="section-heading mb-4">
            My <span className="gradient-text">Thoughts</span>
          </h1>
          <div className="h-px w-24 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full" />
        </motion.div>

        {loading ? (
          <div className="space-y-6">
            <div className="glass h-48 animate-pulse" />
            <div className="glass h-48 animate-pulse" />
          </div>
        ) : (
          <div className="space-y-6">
            {blogs.map((blog, i) => (
              <motion.div
                key={blog.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                {blog.coming_soon ? (
                  // Coming Soon Card
                  <div className="glass p-6 border-dashed border-white/10 opacity-70">
                    <div className="flex items-center gap-2 text-yellow-400/80 mb-2">
                      <FiClock size={14} />
                      <span className="mono text-[10px] uppercase tracking-wider">Coming Soon</span>
                    </div>
                    <h2 className="text-xl font-bold text-white mb-2">{blog.title}</h2>
                    <p className="text-gray-400 text-sm line-clamp-2">{blog.excerpt}</p>
                  </div>
                ) : (
                  // Published Post Card
                  <NavLink to={`/blog/${blog.slug}`} className="block group">
                    <div className="glass glass-hover p-6 md:p-8 flex flex-col md:flex-row gap-6 items-center overflow-hidden relative">
                      {blog.cover_image && (
                        <div className="w-full md:w-48 h-32 flex-shrink-0 rounded-lg overflow-hidden border border-white/10">
                          <img
                            src={`${BASE_URL}${blog.cover_image}`}
                            alt={blog.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="mono text-xs text-cyan-400/60 mb-2">
                          {new Date(blog.created_at).toLocaleDateString('en-US', {
                            month: 'long', day: 'numeric', year: 'numeric'
                          })}
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-3 group-hover:text-cyan-400 transition-colors">
                          {blog.title}
                        </h2>
                        <p className="text-gray-400 text-sm leading-relaxed mb-4 line-clamp-2">
                          {blog.excerpt}
                        </p>
                        <div className="flex items-center gap-2 text-cyan-400 text-sm font-semibold group-hover:translate-x-1 transition-transform">
                          Read Post <FiArrowRight size={16} />
                        </div>
                      </div>
                    </div>
                  </NavLink>
                )}
              </motion.div>
            ))}

            {!loading && blogs.length === 0 && (
              <div className="text-center py-20 text-gray-600 mono text-sm">
                No blog posts published yet.
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
