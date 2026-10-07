import { errorMessage } from '../../api/errors';
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
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4 sm:px-6 grid-bg" style={{ background: 'var(--bg-primary)' }}>
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md text-center glass p-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-6 mx-auto" style={{ background: 'rgba(107, 165, 118, 0.1)' }}>
            <FiCheckCircle style={{ color: 'var(--success)' }} size={32} />
          </div>
          <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>Password Reset Successful</h2>
          <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>Your password has been successfully updated. You can now log in using your new password.</p>
          <NavLink to="/admin/login" className="btn-gradient w-full py-3.5 rounded-lg text-sm font-semibold inline-block">
            Proceed to Login
          </NavLink>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 sm:px-6 grid-bg" style={{ background: 'var(--bg-primary)' }}>
      <div className="absolute top-1/3 right-1/2 translate-x-1/2 w-96 h-96 rounded-full blur-3xl pointer-events-none" style={{ background: 'rgba(212, 175, 55, 0.05)' }} />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
            style={{ background: 'rgba(232, 116, 29, 0.08)', border: '1px solid rgba(232, 116, 29, 0.2)' }}>
            <FiLock style={{ color: 'var(--accent-secondary)' }} size={24} />
          </div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>Create New Password</h1>
          <p className="text-sm mt-1 mono" style={{ color: 'var(--text-secondary)' }}>{email}</p>
        </div>

        <div className="glass p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs mono mb-1.5" style={{ color: 'var(--text-secondary)' }}>New Password</label>
              <div className="relative">
                <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2" size={15} style={{ color: 'var(--text-secondary)' }} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl pl-10 pr-4 py-3 text-sm outline-none transition-all"
                  style={{ background: 'var(--bg-primary)', border: '1px solid rgba(232, 116, 29, 0.2)', color: 'var(--text-primary)' }}
                  placeholder="Minimum 8 characters"
                  autoFocus
                />
              </div>
            </div>

            <div>
              <label className="block text-xs mono mb-1.5" style={{ color: 'var(--text-secondary)' }}>Confirm New Password</label>
              <div className="relative">
                <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2" size={15} style={{ color: 'var(--text-secondary)' }} />
                <input
                  type="password"
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  className="w-full rounded-xl pl-10 pr-4 py-3 text-sm outline-none transition-all"
                  style={{ background: 'var(--bg-primary)', border: '1px solid rgba(232, 116, 29, 0.2)', color: 'var(--text-primary)' }}
                  placeholder="Repeat new password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-gradient w-full py-3.5 rounded-lg text-sm font-semibold disabled:opacity-50"
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        </div>
      </motion.div>
    </main>
  );
}
