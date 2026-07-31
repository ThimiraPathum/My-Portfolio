import { useEffect, useState } from 'react';
import { useParams, NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiGithub, FiExternalLink, FiClock } from 'react-icons/fi';
import { getProjects, getSafeUrl } from '../api';
import MarkdownRenderer from "../components/MarkdownRenderer";

export default function ProjectDetail() {
  const { id } = useParams();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProjects()
      .then(({ data }) => {
        const found = data.find((p: any) => p.id.toString() === id);
        setProject(found);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: 'var(--accent-primary)', borderTopColor: 'transparent' }} />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center pt-20">
        <h1 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Project not found</h1>
        <NavLink to="/projects" style={{ color: 'var(--accent-primary)' }}>← Back to Projects</NavLink>
      </div>
    );
  }

  return (
    <main className="pt-24 pb-20 px-6 min-h-screen grid-bg">
      <div className="max-w-4xl mx-auto">
        <NavLink to="/projects" className="inline-flex items-center gap-2 text-sm mono mb-8 transition-colors"
          style={{ color: 'var(--accent-primary)' }}
          onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--accent-tertiary)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--accent-primary)'; }}
        >
          <FiArrowLeft /> Back to Projects
        </NavLink>

        <motion.article initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <header className="mb-10 text-center">
            {project.coming_soon && (
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs mono mb-4"
                style={{ background: 'rgba(255, 165, 0, 0.1)', color: 'var(--accent-amber)', border: '1px solid rgba(255, 165, 0, 0.2)' }}>
                <FiClock size={12} /> In Progress
              </div>
            )}
            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
              {project.title}
            </h1>
            
            <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
              {project.tech_stack?.map((tech: string) => (
                <span key={tech} className="px-3 py-1 rounded-full text-sm"
                  style={{ background: 'rgba(232, 116, 29, 0.08)', color: 'var(--accent-primary)', border: '1px solid rgba(232, 116, 29, 0.2)' }}>
                  {tech}
                </span>
              ))}
            </div>

            <div className="flex justify-center gap-4 mb-10">
              {project.github_url && (
                <a href={project.github_url} target="_blank" rel="noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg transition"
                  style={{ background: 'rgba(232, 116, 29, 0.05)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
                  <FiGithub /> Source Code
                </a>
              )}
              {project.live_url && (
                <a href={project.live_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-lg btn-gradient transition">
                  <FiExternalLink /> Live Demo
                </a>
              )}
            </div>
          </header>

          {/* Media Section */}
          <div className="space-y-8 mb-12">
            {project.image_url && (
              <div className="w-full overflow-hidden" style={{ borderRadius: '16px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-md)' }}>
                <img src={getSafeUrl(project.image_url)} alt={project.title} className="w-full h-auto max-h-[600px] object-contain" style={{ background: 'var(--bg-secondary)' }} />
              </div>
            )}
            
            {project.video_url && (
              <div className="w-full overflow-hidden" style={{ borderRadius: '16px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-md)' }}>
                <video 
                  src={getSafeUrl(project.video_url)} 
                  controls 
                  autoPlay 
                  loop 
                  muted 
                  className="w-full h-auto max-h-[600px] object-contain"
                />
              </div>
            )}
            
            {project.gallery && Array.isArray(project.gallery) && project.gallery.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {project.gallery.map((img: string, i: number) => (
                  <div key={i} className="overflow-hidden group" style={{ borderRadius: '12px', border: '1px solid var(--border)' }}>
                    <img src={getSafeUrl(img)} alt={`Gallery ${i}`} className="w-full h-48 object-cover group-hover:scale-[1.03] transition-transform duration-500" />
                  </div>
                ))}
              </div>
            )}
            
            {!project.image_url && !project.video_url && (!project.gallery || project.gallery.length === 0) && (
              <div className="w-full aspect-video flex flex-col items-center justify-center" 
                style={{ borderRadius: '16px', border: '2px dashed var(--border)', background: 'rgba(232, 116, 29, 0.03)', color: 'var(--text-secondary)' }}>
                <div className="mono text-sm mb-2">No media uploaded yet</div>
              </div>
            )}
          </div>

          <div className="glass p-8" style={{ lineHeight: '1.7' }}>
            <h2 className="text-xl font-bold mb-4 mt-0 pb-2" style={{ color: 'var(--text-primary)', borderBottom: '1px solid var(--border)', fontFamily: 'var(--font-display)' }}>About the Project</h2>
            <MarkdownRenderer content={project.description} />
          </div>
        </motion.article>
      </div>
    </main>
  );
}
