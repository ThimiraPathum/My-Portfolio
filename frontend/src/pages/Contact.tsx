import { useSettings } from '../context/useSettings';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiSend, FiGithub, FiLinkedin, FiMail } from 'react-icons/fi';
import { sendMessage } from '../api';
import toast from 'react-hot-toast';

export default function Contact() {
  const { settings } = useSettings();
  const socials = [
    { icon: FiMail, label: 'Email', value: settings.social_email, href: settings.social_email ? 'mailto:' + settings.social_email : '' },
    { icon: FiLinkedin, label: 'LinkedIn', value: settings.social_linkedin, href: settings.social_linkedin },
    { icon: FiGithub, label: 'GitHub', value: settings.social_github, href: settings.social_github },
  ].filter(social => social.href);
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.subject || !form.message) {
      toast.error('Please fill in all fields.');
      return;
    }
    setLoading(true);
    try {
      await sendMessage(form);
      toast.success("Message sent! Thimira will get back to you soon.");
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch {
      toast.error('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    background: 'var(--bg-primary)',
    border: '1px solid rgba(232, 116, 29, 0.2)',
    color: 'var(--text-primary)',
  };

  return (
    <section id="contact-section" className="pt-24 pb-20 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Heading */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <h1 className="section-heading mb-4">
            Get In <span className="gradient-text">Touch</span>
          </h1>
          <div className="h-px w-24 rounded-full" style={{ background: 'linear-gradient(to right, var(--accent-secondary), var(--accent-primary))' }} />
          <p className="text-sm mt-4 max-w-xl" style={{ color: 'var(--text-secondary)' }}>
            Interested in collaboration, project ideas, or technology conversations?
            Let's connect and build something meaningful.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Contact form */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-3 glass p-8"
          >
            <h3 className="text-base font-semibold mb-6" style={{ color: 'var(--text-primary)' }}>Send a Message</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs mono mb-1.5" style={{ color: 'var(--text-secondary)' }}>Your Name</label>
                  <input type="text" name="name" value={form.name} onChange={handleChange}
                    placeholder="John Smith" className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all" style={inputStyle} />
                </div>
                <div>
                  <label className="block text-xs mono mb-1.5" style={{ color: 'var(--text-secondary)' }}>Your Email</label>
                  <input type="email" name="email" value={form.email} onChange={handleChange}
                    placeholder="john@email.com" className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all" style={inputStyle} />
                </div>
              </div>
              <div>
                <label className="block text-xs mono mb-1.5" style={{ color: 'var(--text-secondary)' }}>Subject</label>
                <input type="text" name="subject" value={form.subject} onChange={handleChange}
                  placeholder="Project Collaboration" className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all" style={inputStyle} />
              </div>
              <div>
                <label className="block text-xs mono mb-1.5" style={{ color: 'var(--text-secondary)' }}>Message</label>
                <textarea name="message" value={form.message} onChange={handleChange}
                  rows={5} placeholder="Tell me what's on your mind..."
                  className="w-full rounded-xl px-4 py-3 text-sm outline-none resize-none transition-all" style={inputStyle} />
              </div>
              <button type="submit" disabled={loading}
                className="btn-gradient w-full py-3.5 rounded-lg flex items-center justify-center gap-2 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed">
                {loading ? 'Sending...' : <><FiSend size={14} /> Send Message</>}
              </button>
            </form>
          </motion.div>

          {/* Social links */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 space-y-4"
          >
            <div className="glass p-6">
              <h4 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Connect With Me</h4>
              <div className="space-y-3">
                {socials.map(({ icon: Icon, label, value, href }) => (
                  <a key={label} href={href} target="_blank" rel="noreferrer"
                    className="flex items-center gap-3 p-3.5 rounded-xl transition-all group"
                    style={{ border: '1px solid var(--border)' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(232, 116, 29, 0.3)';
                      e.currentTarget.style.background = 'rgba(232, 116, 29, 0.04)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border)';
                      e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <div className="p-2 rounded-lg transition-colors" style={{ background: 'rgba(232, 116, 29, 0.06)' }}>
                      <Icon style={{ color: 'var(--accent-primary)' }} size={16} />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[11px] mono" style={{ color: 'var(--text-secondary)' }}>{label}</div>
                      <div className="text-xs truncate" style={{ color: 'var(--text-primary)' }}>{value}</div>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            <div className="glass p-5 text-center">
              <div className="mono text-xs mb-2" style={{ color: 'var(--accent-secondary)', opacity: 0.6 }}>{'>'} availability</div>
              <div className="text-sm" style={{ color: 'var(--text-primary)' }}>Open to collaborations</div>
              <div className="text-xs mono mt-1" style={{ color: 'var(--text-secondary)' }}>&amp; project conversations</div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
