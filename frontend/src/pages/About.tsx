import { motion } from 'framer-motion';
import { FiCode, FiGlobe, FiWifi, FiLayers, FiBookOpen, FiTool } from 'react-icons/fi';
import { useSettings } from '../context/SettingsContext';

const focusAreas = [
  { icon: FiCode,     label: 'Software Engineering',  desc: 'System design, SRS, modeling' },
  { icon: FiGlobe,    label: 'Web Development',        desc: 'HTML, CSS, JS, React, PHP' },
  { icon: FiWifi,     label: 'Networking',             desc: 'Networking fundamentals' },
  { icon: FiLayers,   label: 'System Analysis',         desc: 'UML, use cases, class diagrams' },
  { icon: FiBookOpen, label: 'Technical Documentation', desc: 'Reports, specs, presentations' },
  { icon: FiTool,     label: 'Database Systems',       desc: 'SQL, database design' },
];

const containerVariants = { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } };
const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

export default function About() {
  const { settings } = useSettings();

  const bio = settings.about_bio || "I'm Thimira Pathum, an undergraduate at the University of Colombo with a strong interest in software engineering, networking, web development, and system design.";
  const career = settings.about_career || "To become a skilled technology professional with strong capabilities in software engineering, networking, and modern digital system development.";
  const name = settings.home_name || "Thimira Pathum";
  const email = settings.social_email || "kasthuriarachchipathum@gmail.com";

  return (
    <main className="pt-24 pb-20 px-4 sm:px-6 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-14">
          <div className="mono text-xs text-cyan-400 mb-3 tracking-widest">{'>'} about.me()</div>
          <h1 className="section-heading mb-4">About <span className="gradient-text">Me</span></h1>
          <div className="h-px w-24 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full" />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mb-10">
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="lg:col-span-3 glass p-8">
            <div className="flex items-start gap-4 mb-7 p-4 rounded-xl bg-cyan-400/5 border border-cyan-400/10">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-[#030712] font-bold text-sm flex-shrink-0 mt-0.5">
                {name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="text-white font-semibold text-sm mb-0.5">{name}</div>
                <div className="text-cyan-400/80 text-xs mono">Undergraduate · University of Colombo · ICT</div>
              </div>
            </div>

            <h3 className="text-sm font-semibold text-cyan-400 mono mb-4">Who Am I</h3>
            <div className="text-gray-400 leading-relaxed mb-6 text-sm whitespace-pre-wrap">
              {bio}
            </div>

            <a href={`mailto:${email}`} className="btn-gradient px-5 py-2.5 rounded-lg text-sm inline-flex items-center gap-2">
              Get In Touch
            </a>
          </motion.div>

          {/* Focus areas */}
          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="lg:col-span-2 grid grid-cols-1 gap-3">
            {focusAreas.map((area) => (
              <motion.div key={area.label} variants={itemVariants} className="glass glass-hover p-4 flex items-center gap-4">
                <div className="p-2 rounded-lg bg-cyan-400/10 flex-shrink-0">
                  <area.icon className="text-cyan-400" size={16} />
                </div>
                <div>
                  <div className="text-white text-sm font-medium">{area.label}</div>
                  <div className="text-gray-600 text-xs mono">{area.desc}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Career Goal */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.5 }} className="mt-6 glass p-8">
          <div className="mono text-xs text-cyan-400 mb-4">{'>'} career.goal()</div>
          <p className="text-gray-400 leading-relaxed text-sm whitespace-pre-wrap">
            {career}
          </p>
        </motion.div>
      </div>
    </main>
  );
}
