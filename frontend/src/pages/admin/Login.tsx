import { useState } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiLock, FiMail, FiTerminal } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
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
      await loginFn(email, password);
      toast.success('Welcome back!');
      navigate('/admin');
    } catch {
      toast.error('Invalid credentials. Check your email and password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4 sm:px-6 grid-bg">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-blue-500/5 blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-cyan-400/10 border border-cyan-400/20 mb-4">
            <FiTerminal className="text-cyan-400" size={24} />
          </div>
          <h1 className="text-2xl font-bold text-white">Admin Access</h1>
          <p className="text-gray-500 text-sm mt-1 mono">portfolio.admin.login()</p>
        </div>

        <div className="glass p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs text-gray-500 mono mb-1.5">Email</label>
              <div className="relative">
                <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600" size={15} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/3 border border-white/8 rounded-xl pl-10 pr-4 py-3 text-sm text-gray-200 placeholder-gray-600 focus:border-cyan-400/40 focus:bg-white/5 outline-none transition-all"
                  placeholder="admin@portfolio.com"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs text-gray-500 mono">Password</label>
                <NavLink to="/admin/forgot-password" className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors">Forgot Password?</NavLink>
              </div>
              <div className="relative">
                <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600" size={15} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/3 border border-white/8 rounded-xl pl-10 pr-4 py-3 text-sm text-gray-200 placeholder-gray-600 focus:border-cyan-400/40 focus:bg-white/5 outline-none transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-gradient w-full py-3.5 rounded-xl text-sm font-semibold disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Login'}
            </button>
          </form>

          <p className="text-center text-xs text-gray-600 mono mt-5">
            Secured with JWT Authentication
          </p>
        </div>
      </motion.div>
    </main>
  );
}
