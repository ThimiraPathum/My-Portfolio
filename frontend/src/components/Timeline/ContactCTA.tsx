import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiSend, FiGithub, FiLinkedin, FiMail } from 'react-icons/fi';
import { useSettings } from '../../context/useSettings';
import { sendMessage } from '../../api';
import toast from 'react-hot-toast';
import TimelineNode from './TimelineNode';

interface ContactCTAProps {
  id: string;
  year: string;
  title: string;
  subtitle: string;
  description: string;
  isActive: boolean;
  onActive: (id: string) => void;
}

export default function ContactCTA({
  id,
  year,
  title,
  subtitle,
  description,
  isActive,
  onActive,
}: ContactCTAProps) {
  const { settings } = useSettings();
  const [form, setForm] = useState({ name: '', email: '', subject: 'Portfolio Contact', message: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error('Please fill in all required fields.');
      return;
    }
    setLoading(true);
    try {
      await sendMessage(form);
      toast.success('Message sent! I will get back to you soon.');
      setForm({ name: '', email: '', subject: 'Portfolio Contact', message: '' });
    } catch {
      toast.error('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const email = settings.social_email || 'pathumt675@gmail.com';
  const github = settings.social_github || 'https://github.com/THIMIRAPATHUM';
  const linkedin = settings.social_linkedin || 'https://linkedin.com/in/thimira-pathum';

  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.8, ease: 'easeOut' as const }
    }
  };

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-20% 0px -20% 0px' }}
      variants={cardVariants}
      onViewportEnter={() => onActive(id)}
      className="relative flex flex-col items-start w-full py-16 scroll-mt-24"
    >
      {/* Node Dot aligned with Spine */}
      <TimelineNode featured={true} type="contact" isActive={isActive} year={year} />

      <div className="w-full pr-0 md:pr-[120px] lg:pr-[25%]">
        <div className="w-full milestone-card p-8 sm:p-10 border relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            
            {/* Form Column */}
            <div className="lg:col-span-3 space-y-4">
              <div className="space-y-1">
                <span className="mono text-[10px] uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>
                  {subtitle}
                </span>
                <h3 
                  className="text-3xl font-semibold tracking-tight"
                  style={{ 
                    fontFamily: 'var(--font-display)', 
                    color: 'var(--accent-primary)',
                    letterSpacing: '-0.02em'
                  }}
                >
                  {title}
                </h3>
                <p className="text-sm leading-relaxed pt-2" style={{ color: 'var(--text-secondary)' }}>
                  {description}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs mono mb-1.5" style={{ color: 'var(--text-secondary)' }}>Your Name</label>
                    <input 
                      type="text" 
                      name="name" 
                      value={form.name} 
                      onChange={handleChange}
                      placeholder="John Smith" 
                      required
                      className="w-full bg-[rgba(232,116,29,0.04)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm outline-none transition-all focus:border-[var(--accent-primary)]" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs mono mb-1.5" style={{ color: 'var(--text-secondary)' }}>Your Email</label>
                    <input 
                      type="email" 
                      name="email" 
                      value={form.email} 
                      onChange={handleChange}
                      placeholder="john@email.com" 
                      required
                      className="w-full bg-[rgba(232,116,29,0.04)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm outline-none transition-all focus:border-[var(--accent-primary)]" 
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs mono mb-1.5" style={{ color: 'var(--text-secondary)' }}>Message</label>
                  <textarea 
                    name="message" 
                    value={form.message} 
                    onChange={handleChange}
                    rows={4} 
                    placeholder="Tell me what's on your mind..."
                    required
                    className="w-full bg-[rgba(232,116,29,0.04)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm outline-none resize-none transition-all focus:border-[var(--accent-primary)]" 
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="btn-gradient w-full py-3.5 rounded-lg flex items-center justify-center gap-2 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Sending...' : <><FiSend size={14} /> Send Message</>}
                </button>
              </form>
            </div>

            {/* Links Column */}
            <div className="lg:col-span-2 flex flex-col justify-between gap-6">
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-widest mono text-[var(--accent-secondary)]">
                  Connect Directly
                </h4>
                <div className="space-y-3">
                  <a 
                    href={`mailto:${email}`}
                    className="flex items-center gap-3 p-3.5 rounded-xl border border-[var(--border)] hover:border-[var(--accent-primary)]/40 hover:bg-[rgba(232,116,29,0.04)] transition-all group"
                  >
                    <div className="p-2 rounded-lg bg-[rgba(232,116,29,0.06)]">
                      <FiMail style={{ color: 'var(--accent-primary)' }} size={16} />
                    </div>
                    <div>
                      <div className="text-[10px] mono" style={{ color: 'var(--text-secondary)' }}>Email</div>
                      <div className="text-xs truncate font-semibold">{email}</div>
                    </div>
                  </a>

                  <a 
                    href={linkedin} 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex items-center gap-3 p-3.5 rounded-xl border border-[var(--border)] hover:border-[var(--accent-primary)]/40 hover:bg-[rgba(232,116,29,0.04)] transition-all group"
                  >
                    <div className="p-2 rounded-lg bg-[rgba(232,116,29,0.06)]">
                      <FiLinkedin style={{ color: 'var(--accent-primary)' }} size={16} />
                    </div>
                    <div>
                      <div className="text-[10px] mono" style={{ color: 'var(--text-secondary)' }}>LinkedIn</div>
                      <div className="text-xs truncate font-semibold">Thimira Pathum</div>
                    </div>
                  </a>

                  <a 
                    href={github} 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex items-center gap-3 p-3.5 rounded-xl border border-[var(--border)] hover:border-[var(--accent-primary)]/40 hover:bg-[rgba(232,116,29,0.04)] transition-all group"
                  >
                    <div className="p-2 rounded-lg bg-[rgba(232,116,29,0.06)]">
                      <FiGithub style={{ color: 'var(--accent-primary)' }} size={16} />
                    </div>
                    <div>
                      <div className="text-[10px] mono" style={{ color: 'var(--text-secondary)' }}>GitHub</div>
                      <div className="text-xs truncate font-semibold">THIMIRAPATHUM</div>
                    </div>
                  </a>
                </div>
              </div>

              {/* Availability tag */}
              <div className="border border-[var(--border)] p-4 rounded-2xl text-center bg-[rgba(212,175,55,0.03)]">
                <div className="mono text-[10px] tracking-widest" style={{ color: 'var(--accent-secondary)' }}>
                  ● CURRENT AVAILABILITY
                </div>
                <div className="text-sm font-semibold pt-1" style={{ color: 'var(--text-primary)' }}>
                  Open for Opportunities
                </div>
                <div className="text-[10px] mono pt-0.5" style={{ color: 'var(--text-secondary)' }}>
                  DevOps • MLOps • AI Engineering
                </div>
              </div>

            </div>

          </div>
        </div>
      </div>
    </motion.div>
  );
}
