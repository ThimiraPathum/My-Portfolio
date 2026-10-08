import { motion } from 'framer-motion';
import { FiServer, FiCpu, FiGitMerge, FiLayers, FiArrowRight } from 'react-icons/fi';
import { useSettings } from '../context/useSettings';
import { NavLink } from 'react-router-dom';
import MarkdownRenderer from '../components/MarkdownRenderer';

const expertise = [
  {
    icon: FiCpu,
    title: 'AI & Machine Learning',
    desc: 'Building machine learning applications with Python, Scikit-learn, TensorFlow, and PyTorch, supported by data analysis and visualization.',
  },
  {
    icon: FiLayers,
    title: 'Full-Stack Development',
    desc: 'Developing responsive interfaces and backend APIs with React, TypeScript, FastAPI, and Laravel, backed by relational and NoSQL databases.',
  },
  {
    icon: FiGitMerge,
    title: 'LLMs & Agentic AI',
    desc: 'Integrating local and cloud-based language models and building multi-step AI workflows with LangChain, LangGraph, and Ollama.',
  },
  {
    icon: FiServer,
    title: 'DevOps & Cloud',
    desc: 'Containerizing and deploying applications with Docker, GitHub Actions, Linux, and cloud platforms including Azure and AWS.',
  },
];

const containerVariants = { hidden: {}, visible: { transition: { staggerChildren: 0.12 } } };
const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

export default function About() {
  const { settings } = useSettings();


  const email = settings.social_email ?? 'kasthuriarachchipathum@gmail.com';

  const bio = settings.about_bio ??
    `I am Thimira Pathum, an Information and Communication Technology undergraduate at the University of Colombo whose career is defined by optimizing complex systems.

My professional roots as an award-winning industrial mechanic instilled a rigorous, hands-on approach to preventive maintenance and troubleshooting. I brought that analytical mindset into software engineering, and it now drives my journey into DevOps and MLOps.

I thrive at the intersection of infrastructure and development — combining my expertise in custom Linux architectures, backend development (Java, Laravel), and networking to automate workflows, streamline deployments, and operationalize machine learning models.

I am passionate about building resilient systems that bridge the gap between clean code and reliable production environments.`;

  return (
    <section id="about-section" className="pt-20 pb-16 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">

        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.5 }}
          className="mb-16"
        >
          <div className="mono text-xs mb-3 tracking-widest" style={{ color: 'var(--accent-primary)' }}>{'>'} about.me()</div>
          <h1 className="section-heading mb-4">
            About <span className="gradient-text">Me</span>
          </h1>
          <div className="h-px w-24 rounded-full" style={{ background: 'linear-gradient(to right, var(--accent-secondary), var(--accent-primary))' }} />
        </motion.div>

        {/* Main content — 2 column */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">

          {/* Left — Bio */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.6 }}
          >


            {/* Bio text */}
            <MarkdownRenderer content={bio} className="mb-8" />

            {/* CTAs */}
            <div className="flex flex-wrap gap-3">
              <a
                href={`mailto:${email}`}
                className="btn-gradient px-5 py-2.5 rounded-lg text-sm inline-flex items-center gap-2"
              >
                Get In Touch <FiArrowRight size={14} />
              </a>
              <NavLink
                to="/projects"
                className="px-5 py-2.5 rounded-lg text-sm inline-flex items-center gap-2 transition-all"
                style={{ border: '1px solid var(--accent-primary)', color: 'var(--accent-primary)' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(232, 116, 29, 0.06)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#FFFFFF'; }}
              >
                View Projects
              </NavLink>
            </div>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            {expertise.map((item) => (
              <motion.div
                key={item.title}
                variants={itemVariants}
                className="p-5 rounded-2xl flex flex-col gap-2.5 transition-all duration-300"
                style={{
                  background: '#FFFFFF',
                  border: '1px solid rgba(212, 175, 55, 0.14)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(232, 116, 29, 0.04)';
                  e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.32)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#FFFFFF';
                  e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.14)';
                }}
              >
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(232, 116, 29, 0.08)' }}
                >
                  <item.icon size={15} style={{ color: 'var(--accent-primary)' }} />
                </div>
                <div>
                  <div className="text-base font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                    {item.title}
                  </div>
                  <div className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                    {item.desc}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

      </div>
    </section>
  );
}
