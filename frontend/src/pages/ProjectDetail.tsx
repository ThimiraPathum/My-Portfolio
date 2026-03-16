import { useEffect, useState } from 'react';
import { useParams, NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiGithub, FiExternalLink, FiClock } from 'react-icons/fi';
import { getProjects, BASE_URL } from '../api';

export default function ProjectDetail() {
  const { id } = useParams();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // We already have getProject by ID in the backend, but we can just use the getProjects list or create a getProject API method.
    // Wait, the API index has `export const getProjects = () => api.get('/projects');`.
    // Let's just fetch all and find it, or we could add `getProject(id)` to api/index.ts.
    // Since it's quick, let's fetch all and filter for now to avoid altering api.ts if we don't have to,
    // actually, let's use the API if we added it, but I don't think I added getProject(id) to frontend api/index.ts.
    // I will fetch all and find the one.
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
        <div className="w-8 h-8 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center pt-20">
        <h1 className="text-2xl font-bold text-white mb-4">Project not found</h1>
        <NavLink to="/projects" className="text-cyan-400">← Back to Projects</NavLink>
      </div>
    );
  }

  return (
    <main className="pt-24 pb-20 px-6 min-h-screen grid-bg">
      <div className="max-w-4xl mx-auto">
        <NavLink to="/projects" className="inline-flex items-center gap-2 text-cyan-400 text-sm mono mb-8 hover:text-cyan-300">
          <FiArrowLeft /> Back to Projects
        </NavLink>

        <motion.article initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <header className="mb-10 text-center">
            {project.coming_soon && (
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-400/10 text-yellow-400 text-xs mono mb-4 border border-yellow-400/20">
                <FiClock size={12} /> Coming Soon
              </div>
            )}
            <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight mb-6">
              {project.title}
            </h1>
            
            <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
              {project.tech_stack?.map((tech: string) => (
                <span key={tech} className="px-3 py-1 rounded-full bg-cyan-400/10 text-cyan-400 text-sm border border-cyan-400/20">
                  {tech}
                </span>
              ))}
            </div>

            <div className="flex justify-center gap-4 mb-10">
              {project.github_url && (
                <a href={project.github_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white hover:bg-white/10 transition">
                  <FiGithub /> Source Code
                </a>
              )}
              {project.live_url && (
                <a href={project.live_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-lg btn-gradient text-white transition">
                  <FiExternalLink /> Live Demo
                </a>
              )}
            </div>
          </header>

          {/* Media Section */}
          <div className="space-y-8 mb-12">
            {project.image_url && (
              <div className="w-full rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-black/50">
                <img src={`${BASE_URL}${project.image_url}`} alt={project.title} className="w-full h-auto max-h-[600px] object-contain" />
              </div>
            )}
            
            {project.video_url && (
              <div className="w-full rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-black/50">
                <video 
                  src={`${BASE_URL}${project.video_url}`} 
                  controls 
                  autoPlay 
                  loop 
                  muted 
                  className="w-full h-auto max-h-[600px] object-contain"
                />
              </div>
            )}
            
            {project.gallery && Array.isArray(project.gallery) && project.gallery.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {project.gallery.map((img: string, i: number) => (
                  <div key={i} className="rounded-xl overflow-hidden border border-white/10 glass">
                    <img src={`${BASE_URL}${img}`} alt={`Gallery ${i}`} className="w-full h-48 object-cover hover:scale-105 transition-transform duration-500" />
                  </div>
                ))}
              </div>
            )}
            
            {!project.image_url && !project.video_url && (!project.gallery || project.gallery.length === 0) && (
              <div className="w-full aspect-video rounded-2xl border border-dashed border-white/20 flex flex-col items-center justify-center text-gray-500 bg-white/5">
                <div className="mono text-sm mb-2">No media uploaded yet</div>
              </div>
            )}
          </div>

          <div className="prose prose-invert prose-cyan max-w-none text-gray-300 leading-relaxed marker:text-cyan-400 whitespace-pre-wrap font-sans text-lg glass p-8">
            <h2 className="text-xl font-bold text-white mb-4 mt-0 border-b border-white/10 pb-2">About the Project</h2>
            {project.description}
          </div>
        </motion.article>
      </div>
    </main>
  );
}
