import { errorMessage } from '../../api/errors';
import { useState } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiLock, FiMail, FiTerminal } from 'react-icons/fi';
import { useAuth } from '../../context/useAuth';
import toast from 'react-hot-toast';

export default function AdminLogin() {
  const [email, setEmail] = useState('pathumt675@gmail.com');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { loginFn } = useAuth();
  const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await loginFn(email.trim(), password);
      toast.success('Welcome back!');
      navigate('/admin');
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4 sm:px-6 grid-bg" style={{ background: 'var(--bg-primary)' }}>
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full blur-3xl pointer-events-none" style={{ background: 'rgba(212, 175, 55, 0.05)' }} />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
            style={{ background: 'rgba(232, 116, 29, 0.08)', border: '1px solid rgba(232, 116, 29, 0.2)' }}>
            <FiTerminal style={{ color: 'var(--accent-secondary)' }} size={24} />
          </div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>Admin Access</h1>
          <p className="text-sm mt-1 mono" style={{ color: 'var(--text-secondary)' }}>portfolio.admin.login()</p>
        </div>

        <div className="glass p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs mono mb-1.5" style={{ color: 'var(--text-secondary)' }}>Email</label>
              <div className="relative">
                <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2" size={15} style={{ color: 'var(--text-secondary)' }} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl pl-10 pr-4 py-3 text-sm outline-none transition-all"
                  style={{ background: 'var(--bg-primary)', border: '1px solid rgba(232, 116, 29, 0.2)', color: 'var(--text-primary)' }}
                  placeholder="admin@portfolio.com"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs mono" style={{ color: 'var(--text-secondary)' }}>Password</label>
                <NavLink to="/admin/forgot-password" className="text-xs transition-colors" style={{ color: 'var(--accent-primary)' }}>Forgot Password?</NavLink>
              </div>
              <div className="relative">
                <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2" size={15} style={{ color: 'var(--text-secondary)' }} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl pl-10 pr-4 py-3 text-sm outline-none transition-all"
                  style={{ background: 'var(--bg-primary)', border: '1px solid rgba(232, 116, 29, 0.2)', color: 'var(--text-primary)' }}
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-gradient w-full py-3.5 rounded-lg text-sm font-semibold disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Login'}
            </button>
          </form>

          <p className="text-center text-xs mono mt-5" style={{ color: 'var(--text-secondary)' }}>
            Secured with JWT Authentication
          </p>
        </div>
      </motion.div>
    </main>
  );
}
