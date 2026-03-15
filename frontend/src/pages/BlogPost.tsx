import { useEffect, useState } from 'react';
import { useParams, NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiMessageSquare } from 'react-icons/fi';
import { getBlog, postComment, BASE_URL } from '../api';
import toast from 'react-hot-toast';

export default function BlogPost() {
  const { slug } = useParams();
  const [blog, setBlog] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [form, setForm] = useState({ name: '', email: '', body: '' });
  const [commenting, setCommenting] = useState(false);

  useEffect(() => {
    if (slug) {
      getBlog(slug)
        .then(({ data }) => setBlog(data))
        .catch(() => setError(true))
        .finally(() => setLoading(false));
    }
  }, [slug]);

  const submitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.body) return toast.error('Fill in all fields');
    setCommenting(true);
    try {
      await postComment(blog.id, form);
      toast.success('Comment submitted! Waiting for approval.');
      setForm({ name: '', email: '', body: '' });
    } catch {
      toast.error('Failed to post comment.');
    } finally {
      setCommenting(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center pt-20"><div className="w-8 h-8 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" /></div>;
  }

  if (error || !blog) {
    return <div className="min-h-screen flex flex-col items-center justify-center pt-20">
      <h1 className="text-2xl font-bold text-white mb-4">Post not found</h1>
      <NavLink to="/blog" className="text-cyan-400">← Back to Blog</NavLink>
    </div>;
  }

  const cleanContent = (blog?.content || '').replace(/^\\s*New blog content here\\.\\.\\.\\s*/i, '');

  return (
    <main className="pt-24 pb-20 px-6 min-h-screen grid-bg">
      <div className="max-w-3xl mx-auto">
        <NavLink to="/blog" className="inline-flex items-center gap-2 text-cyan-400 text-sm mono mb-8 hover:text-cyan-300">
          <FiArrowLeft /> Back
        </NavLink>

        <motion.article initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <header className="mb-10 text-center">
            <div className="mono text-xs text-gray-500 mb-4">
              {new Date(blog.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight mb-8">
              {blog.title}
            </h1>
            {blog.cover_image && (
              <div className="w-full aspect-video rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                 <img src={`${BASE_URL}${blog.cover_image}`} alt={blog.title} className="w-full h-full object-cover" />
              </div>
            )}
          </header>

          <div className="text-gray-300 leading-relaxed font-sans text-base md:text-lg whitespace-pre-wrap">
            {cleanContent}
          </div>
        </motion.article>

        {/* Comments Section */}
        <div className="mt-20 pt-10 border-t border-white/5">
          <h3 className="text-2xl font-bold text-white flex items-center gap-2 mb-8">
            <FiMessageSquare /> Comments ({blog.comments?.length || 0})
          </h3>

          <div className="space-y-6 mb-10">
            {blog.comments?.map((comment: any) => (
              <div key={comment.id} className="glass p-5 flex gap-4">
                <div className="w-10 h-10 rounded-full bg-cyan-400/10 flex items-center justify-center text-cyan-400 font-bold uppercase shrink-0">
                  {comment.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-base gap-3 mb-1">
                    <span className="font-semibold text-white">{comment.name}</span>
                    <span className="text-xs text-gray-500 mono">{new Date(comment.created_at).toLocaleDateString()}</span>
                  </div>
                  <p className="text-gray-400 text-sm">{comment.body}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="glass p-6 md:p-8">
            <h4 className="text-lg font-semibold text-white mb-4">Leave a Reply</h4>
            <form onSubmit={submitComment} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input type="text" placeholder="Name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-gray-200 outline-none focus:border-cyan-400/50" />
                <input type="email" placeholder="Email (will not be published)" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-gray-200 outline-none focus:border-cyan-400/50" />
              </div>
              <textarea placeholder="Your comment..." rows={4} required value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-gray-200 outline-none focus:border-cyan-400/50 resize-none" />
              <button type="submit" disabled={commenting}
                className="btn-gradient px-6 py-3 rounded-xl text-sm font-semibold disabled:opacity-50">
                {commenting ? 'Submitting...' : 'Post Comment'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
