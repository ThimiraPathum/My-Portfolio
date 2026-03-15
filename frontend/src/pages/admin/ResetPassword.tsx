import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiLock, FiCheckCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { resetPassword } from '../../api';

export default function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get('token') || '';
  const email = params.get('email') || '';

  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!token || !email) {
      toast.error('Invalid password reset link.');
      navigate('/admin/login');
    }
  }, [token, email, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== passwordConfirm) {
      toast.error('Passwords do not match.');
      return;
    }
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters long.');
      return;
    }

    setLoading(true);
    try {
      await resetPassword({
        token,
        email,
        password,
        password_confirmation: passwordConfirm
      });
      
      toast.success('Password successfully reset!');
      setSuccess(true);
    } catch (error: any) {
      const data = error.response?.data;
      toast.error(data?.email || data?.password || data?.message || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4 sm:px-6 grid-bg">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md text-center glass p-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/10 mb-6 mx-auto">
            <FiCheckCircle className="text-green-400" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Password Reset Successful</h2>
          <p className="text-gray-400 text-sm mb-6">Your password has been successfully updated. You can now log in using your new password.</p>
          <NavLink to="/admin/login" className="btn-gradient w-full py-3.5 rounded-xl text-sm font-semibold inline-block">
            Proceed to Login
          </NavLink>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 sm:px-6 grid-bg">
      <div className="absolute top-1/3 right-1/2 translate-x-1/2 w-96 h-96 rounded-full bg-cyan-500/5 blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-cyan-400/10 border border-cyan-400/20 mb-4">
            <FiLock className="text-cyan-400" size={24} />
          </div>
          <h1 className="text-2xl font-bold text-white">Create New Password</h1>
          <p className="text-gray-500 text-sm mt-1 mono">{email}</p>
        </div>

        <div className="glass p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs text-gray-500 mono mb-1.5">New Password</label>
              <div className="relative">
                <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600" size={15} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/3 border border-white/8 rounded-xl pl-10 pr-4 py-3 text-sm text-gray-200 placeholder-gray-600 focus:border-cyan-400/40 focus:bg-white/5 outline-none transition-all"
                  placeholder="Minimum 8 characters"
                  autoFocus
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-gray-500 mono mb-1.5">Confirm New Password</label>
              <div className="relative">
                <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600" size={15} />
                <input
                  type="password"
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  className="w-full bg-white/3 border border-white/8 rounded-xl pl-10 pr-4 py-3 text-sm text-gray-200 placeholder-gray-600 focus:border-cyan-400/40 focus:bg-white/5 outline-none transition-all"
                  placeholder="Repeat new password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-gradient w-full py-3.5 rounded-xl text-sm font-semibold disabled:opacity-50"
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        </div>
      </motion.div>
    </main>
  );
}
