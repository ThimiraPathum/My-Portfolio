import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiSend, FiGithub, FiLinkedin, FiMail } from 'react-icons/fi';
import { sendMessage } from '../api';
import toast from 'react-hot-toast';

const socials = [
  {
    icon: FiMail,
    label: 'Email',
    value: 'kasthuriarachchipathum@gmail.com',
    href: 'mailto:kasthuriarachchipathum@gmail.com',
  },
  {
    icon: FiLinkedin,
    label: 'LinkedIn',
    value: 'linkedin.com/in/thimira-pathum',
    href: 'https://linkedin.com/in/thimira-pathum',
  },
  {
    icon: FiGithub,
    label: 'GitHub',
    value: 'github.com/thimira-pathum',
    href: 'https://github.com/thimira-pathum',
  },
];

export default function Contact() {
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

  const inputClass =
    'w-full bg-white/3 border border-white/8 rounded-xl px-4 py-3 text-sm text-gray-200 placeholder-gray-600 transition-all focus:border-cyan-400/40 focus:bg-white/5 outline-none';

  return (
    <main className="pt-24 pb-20 px-4 sm:px-6 min-h-screen">
      <div className="max-w-5xl mx-auto">
        {/* Heading */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <div className="mono text-xs text-cyan-400 mb-3 tracking-widest">{'>'} contact.init()</div>
          <h1 className="section-heading mb-4">
            Get In <span className="gradient-text">Touch</span>
          </h1>
          <div className="h-px w-24 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full" />
          <p className="text-gray-500 text-sm mt-4 max-w-xl">
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
            <h3 className="text-base font-semibold text-white mb-6">Send a Message</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mono mb-1.5">Your Name</label>
                  <input type="text" name="name" value={form.name} onChange={handleChange}
                    placeholder="John Smith" className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mono mb-1.5">Your Email</label>
                  <input type="email" name="email" value={form.email} onChange={handleChange}
                    placeholder="john@email.com" className={inputClass} />
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mono mb-1.5">Subject</label>
                <input type="text" name="subject" value={form.subject} onChange={handleChange}
                  placeholder="Project Collaboration" className={inputClass} />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mono mb-1.5">Message</label>
                <textarea name="message" value={form.message} onChange={handleChange}
                  rows={5} placeholder="Tell me about your idea..."
                  className={inputClass + ' resize-none'} />
              </div>
              <button type="submit" disabled={loading}
                className="btn-gradient w-full py-3.5 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed">
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
              <h4 className="text-sm font-semibold text-white mb-4">Connect With Me</h4>
              <div className="space-y-3">
                {socials.map(({ icon: Icon, label, value, href }) => (
                  <a key={label} href={href} target="_blank" rel="noreferrer"
                    className="flex items-center gap-3 p-3.5 rounded-xl border border-white/5 hover:border-cyan-400/20 hover:bg-cyan-400/5 transition-all group">
                    <div className="p-2 rounded-lg bg-white/5 group-hover:bg-cyan-400/10 transition-colors">
                      <Icon className="text-cyan-400" size={16} />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[11px] text-gray-600 mono">{label}</div>
                      <div className="text-xs text-gray-300 truncate">{value}</div>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            <div className="glass p-5 text-center">
              <div className="mono text-xs text-cyan-400/40 mb-2">{'>'} availability</div>
              <div className="text-sm text-gray-300">Open to collaborations</div>
              <div className="text-xs text-gray-600 mono mt-1">& project conversations</div>
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
