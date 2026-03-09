import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiLogOut, FiTrash2, FiMail, FiCheck, FiCode, FiDatabase, FiSettings, FiEdit3, FiMessageSquare, FiImage, FiVideo, FiPlus, FiBriefcase, FiX } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import toast from 'react-hot-toast';
import {
  getMessages, markRead, deleteMessage,
  getProjects, createProject, updateProject, deleteProject,
  getSkills, createSkill, updateSkill as apiUpdateSkill, deleteSkill,
  getExperiences, createExperience, deleteExperience,
  updateSettings,
  getAdminBlogs, createBlog, updateBlog, deleteBlog,
  getAllComments, approveComment, deleteComment,
  uploadFile
} from '../../api';

type TabType = 'messages' | 'settings' | 'blogs' | 'comments' | 'projects' | 'skills' | 'experience';

export default function AdminDashboard() {
  const { logoutFn } = useAuth();
  const { settings, refreshSettings } = useSettings();
  
  const [tab, setTab] = useState<TabType>('messages');
  const [loading, setLoading] = useState(false);
  const [loadedTabs, setLoadedTabs] = useState<Set<TabType>>(new Set(['messages']));
  
  // Modal state for creating new items
  const [modal, setModal] = useState<{ isOpen: boolean; title: string; label: string; placeholder: string; onConfirm: (val: string) => void } | null>(null);

  // Data states
  const [messages, setMessages] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [skills, setSkills] = useState<any[]>([]);
  const [experiences, setExperiences] = useState<any[]>([]);
  const [blogs, setBlogs] = useState<any[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  
  // Settings form
  const [settingForm, setSettingForm] = useState<Record<string, string>>({});

  const loadTabData = useCallback(async (t: TabType, showSpinner = true) => {
    if (showSpinner) setLoading(true);
    try {
      switch (t) {
        case 'messages': setMessages((await getMessages()).data); break;
        case 'projects': setProjects((await getProjects()).data); break;
        case 'skills': setSkills((await getSkills()).data); break;
        case 'experience': setExperiences((await getExperiences()).data); break;
        case 'blogs': setBlogs((await getAdminBlogs()).data); break;
        case 'comments': setComments((await getAllComments()).data); break;
      }
      setLoadedTabs(prev => new Set(prev).add(t));
    } catch {
      toast.error('Failed to load data');
    }
    if (showSpinner) setLoading(false);
  }, []);

  // Load tab data when tab changes (only if not loaded yet)
  useEffect(() => {
    if (!loadedTabs.has(tab)) {
      loadTabData(tab);
    }
  }, [tab, loadedTabs, loadTabData]);

  useEffect(() => {
    if (settings) setSettingForm(settings);
  }, [settings]);

  // Silent refresh — no loading spinner, runs after mutations for current tab
  const refreshData = async () => {
    try {
      switch (tab) {
        case 'messages':
          const msgs = await getMessages();
          setMessages(msgs.data);
          break;
        case 'projects':
          const projs = await getProjects();
          setProjects(projs.data);
          break;
        case 'skills':
          const skls = await getSkills();
          setSkills(skls.data);
          break;
        case 'experience':
          const exps = await getExperiences();
          setExperiences(exps.data);
          break;
        case 'blogs':
          const blgs = await getAdminBlogs();
          setBlogs(blgs.data);
          break;
        case 'comments':
          const cmts = await getAllComments();
          setComments(cmts.data);
          break;
      }
    } catch { /* silent */ }
  };

  const handleLogout = async () => {
    try {
      await logoutFn();
      // Notice: we don't call navigate('/admin/login') here because 
      // AuthContext updates immediately, triggering ProtectedRoute to redirect.
    } catch {
      toast.error('Failed to logout');
    }
  };

  // --- Actions ---

  const handleSaveSettings = async () => {
    try {
      await updateSettings(settingForm);
      await refreshSettings();
      toast.success('Settings updated!');
    } catch { toast.error('Failed to save settings'); }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'image'|'video') => {
    const file = e.target.files?.[0];
    if (!file) return null;
    toast.loading(`Uploading ${type}...`, { id: 'upload' });
    try {
      const { data } = await uploadFile(file, type);
      toast.success('Uploaded', { id: 'upload' });
      return data.url;
    } catch {
      toast.error('Upload failed', { id: 'upload' });
      return null;
    }
  };

  const handleCreateProject = () => {
    setModal({
      isOpen: true,
      title: 'Create New Project',
      label: 'Project Title',
      placeholder: 'Enter project title...',
      onConfirm: async (title) => {
        try {
          await createProject({ title, description: 'New project...', order: 99, category: 'web', tech_stack: [], featured: false, coming_soon: false });
          toast.success('Project created');
          refreshData();
        } catch { toast.error('Failed'); }
        setModal(null);
      }
    });
  };

  const handleCreateSkill = () => {
    setModal({
      isOpen: true,
      title: 'Create New Skill',
      label: 'Skill Name',
      placeholder: 'Enter skill name...',
      onConfirm: async (name) => {
        try {
          await createSkill({ name, category: 'Frontend', level: 50, order: 99 });
          toast.success('Skill created');
          refreshData();
        } catch { toast.error('Failed'); }
        setModal(null);
      }
    });
  };

  const handleCreateBlog = () => {
    setModal({
      isOpen: true,
      title: 'Create New Blog Post',
      label: 'Blog Title',
      placeholder: 'Enter blog title...',
      onConfirm: async (title) => {
        try {
          await createBlog({ title, excerpt: '', content: 'New blog content here...', status: 'draft', coming_soon: false });
          toast.success('Blog created as draft');
          refreshData();
        } catch { toast.error('Failed'); }
        setModal(null);
      }
    });
  };

  async function handleUpdateSkill(id: number, data: any) {
    // Optimistic UI update
    setSkills(s => s.map(x => x.id === id ? { ...x, ...data } : x));
    // Persist to backend
    try {
      await apiUpdateSkill(id, data);
    } catch {
      toast.error('Failed to update skill');
      refreshData(); // revert optimistic update on failure
    }
  }

  async function apiUpdateExperience(id: number, data: any) {
    try {
      // we already updated local state on change, so just persist
      await fetch(`http://localhost:8000/api/experiences/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(data)
      });
    } catch {
      toast.error('Failed to update experience');
      refreshData();
    }
  }

  const tabs: { key: TabType, label: string, icon: any }[] = [
    { key: 'messages', label: 'Messages', icon: FiMail },
    { key: 'settings', label: 'Site Settings', icon: FiSettings },
    { key: 'blogs', label: 'Blog Posts', icon: FiEdit3 },
    { key: 'comments', label: 'Comments', icon: FiMessageSquare },
    { key: 'projects', label: 'Projects', icon: FiCode },
    { key: 'skills', label: 'Skills', icon: FiDatabase },
    { key: 'experience', label: 'Experience', icon: FiBriefcase },
  ];

  return (
    <main className="pt-24 pb-20 px-4 sm:px-6 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="mono text-xs text-cyan-400 mb-2">{'>'} admin.dashboard()</div>
            <h1 className="text-3xl font-bold text-white">Full <span className="gradient-text">CMS Dashboard</span></h1>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 text-gray-400 hover:text-white transition-all text-sm">
            <FiLogOut size={15} /> Logout
          </button>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-6 border-b border-white/5 pb-4">
          {tabs.map(({ key, label, icon: Icon }) => (
            <button key={key} onClick={() => setTab(key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                tab === key ? 'bg-cyan-400/10 text-cyan-400 border border-cyan-400/20' : 'text-gray-500 hover:text-gray-300'
              }`}>
              <Icon size={14} /> {label}
            </button>
          ))}
        </div>

        {loading ? <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="glass h-20 animate-pulse" />)}</div> : (
          <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            
            {/* MESSAGES TAB */}
            {tab === 'messages' && messages.map((msg) => (
              <div key={msg.id} className={`glass p-5 flex items-start gap-4 ${!msg.read ? 'border-cyan-400/30' : ''}`}>
                <div className="flex-1">
                  <div className="flex gap-2 mb-1"><span className="font-semibold text-white text-sm">{msg.name}</span><span className="text-gray-500 text-xs mono">{msg.email}</span></div>
                  <div className="text-cyan-400 text-xs mb-2 font-medium">{msg.subject}</div>
                  <p className="text-gray-400 text-sm whitespace-pre-wrap">{msg.message}</p>
                </div>
                <div className="flex gap-2">
                  {!msg.read && <button onClick={() => markRead(msg.id).then(refreshData)} className="p-2 text-cyan-400 hover:bg-cyan-400/10 rounded"><FiCheck /></button>}
                  <button onClick={() => deleteMessage(msg.id).then(refreshData)} className="p-2 text-red-400 hover:bg-red-400/10 rounded"><FiTrash2 /></button>
                </div>
              </div>
            ))}
            {tab === 'messages' && messages.length === 0 && <div className="glass p-8 text-center text-gray-500">No messages yet</div>}

            {/* SETTINGS TAB */}
            {tab === 'settings' && (
              <div className="glass p-6 space-y-6">
                <h3 className="text-lg font-bold text-white mb-4">Edit Public Content</h3>
                {Object.keys(settingForm).filter(k => k !== 'profile_photo').map((key) => (
                  <div key={key}>
                    <label className="block text-xs text-gray-500 mono mb-1">{key.replace('_', ' ').toUpperCase()}</label>
                    {settingForm[key]?.length > 100 || key.includes('bio') || key.includes('description') ? (
                      <textarea value={settingForm[key]} onChange={(e) => setSettingForm({ ...settingForm, [key]: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded text-sm text-gray-200 p-3 h-32 focus:border-cyan-400/50 outline-none" />
                    ) : (
                      <input value={settingForm[key]} onChange={(e) => setSettingForm({ ...settingForm, [key]: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded text-sm text-gray-200 p-3 focus:border-cyan-400/50 outline-none" />
                    )}
                  </div>
                ))}
                
                {/* Profile Photo Upload */}
                <div>
                  <label className="block text-xs text-gray-500 mono mb-2">PROFILE PHOTO</label>
                  <div className="flex items-center gap-4">
                    {(settingForm.profile_photo || settings.profile_photo) ? (
                      <img 
                        src={`http://localhost:8000${settingForm.profile_photo || settings.profile_photo}`} 
                        alt="Profile Preview" 
                        className="w-16 h-16 rounded-full object-cover border border-white/10"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-500">
                        <FiImage size={24} />
                      </div>
                    )}
                    <label className="btn-gradient px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer">
                      Upload New Photo
                      <input 
                        type="file" 
                        className="hidden" 
                        accept="image/*"
                        onChange={async (e) => {
                          const url = await handleFileUpload(e, 'image');
                          if (url) {
                            setSettingForm({ ...settingForm, profile_photo: url });
                          }
                        }}
                      />
                    </label>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Recommended size: 500x500px or larger. Overrides default profile photo on home page.</p>
                </div>

                <div className="pt-4 border-t border-white/5">
                  <button onClick={handleSaveSettings} className="btn-gradient px-6 py-2.5 rounded-lg text-sm font-semibold">Save All Settings</button>
                </div>
              </div>
            )}

            {/* BLOGS TAB */}
            {tab === 'blogs' && (
              <>
                <button onClick={handleCreateBlog} className="btn-gradient px-4 py-2 rounded-lg text-sm mb-4 inline-flex items-center gap-2"><FiPlus/> New Blog</button>
                {blogs.map((b) => (
                  <BlogCard key={b.id} blog={b} onUpdate={(data) => updateBlog(b.id, data).then(refreshData)} onDelete={() => deleteBlog(b.id).then(refreshData)} onUpload={handleFileUpload} setBlogs={setBlogs} />
                ))}
              </>
            )}

            {/* COMMENTS TAB */}
            {tab === 'comments' && comments.map((c) => (
              <div key={c.id} className={`glass p-4 flex gap-4 ${!c.approved ? 'border-yellow-400/30' : ''}`}>
                <div className="flex-1">
                  <div className="text-xs text-purple-400 mono mb-1">On: {c.blog?.title}</div>
                  <div className="text-sm text-white font-semibold">{c.name} <span className="text-gray-500 text-xs font-normal">({c.email})</span></div>
                  <p className="text-gray-400 text-sm mt-1">{c.body}</p>
                </div>
                <div className="flex gap-2 items-start">
                  {!c.approved && <button onClick={() => approveComment(c.id).then(refreshData)} className="p-2 text-green-400 hover:bg-green-400/10 rounded border border-green-400/20 text-xs flex items-center gap-1"><FiCheck/> Approve</button>}
                  <button onClick={() => deleteComment(c.id).then(refreshData)} className="p-2 text-red-400 hover:bg-red-400/10 rounded border border-red-400/20 text-xs"><FiTrash2/></button>
                </div>
              </div>
            ))}
            {tab === 'comments' && comments.length === 0 && <div className="glass p-8 text-center text-gray-500">No comments yet</div>}

            {/* PROJECTS TAB */}
            {tab === 'projects' && (
              <>
                <button onClick={handleCreateProject} className="btn-gradient px-4 py-2 rounded-lg text-sm mb-4 inline-flex items-center gap-2"><FiPlus/> New Project</button>
                {projects.map((p) => (
                  <ProjectCard key={p.id} project={p} onUpdate={(data) => updateProject(p.id, data).then(refreshData)} onDelete={() => deleteProject(p.id).then(refreshData)} onUpload={handleFileUpload} setProjects={setProjects} />
                ))}
              </>
            )}

            {/* SKILLS TAB */}
            {tab === 'skills' && (
              <>
                <button onClick={handleCreateSkill} className="btn-gradient px-4 py-2 rounded-lg text-sm mb-4 inline-flex items-center gap-2"><FiPlus/> New Skill</button>
                <div className="grid grid-cols-2 gap-4">
                  {skills.map((s) => (
                    <div key={s.id} className="glass p-4 flex justify-between items-center">
                      <div className="w-full pr-4">
                        <SkillNameInput value={s.name} onSave={(name) => handleUpdateSkill(s.id, { name })} />
                        <input type="range" min="0" max="100" value={s.level} onChange={(e) => handleUpdateSkill(s.id, { level: Number(e.target.value) })} className="w-full accent-cyan-400" />
                      </div>
                      <button onClick={() => deleteSkill(s.id).then(refreshData)} className="p-2 text-red-400"><FiTrash2 size={16}/></button>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* EXPERIENCE TAB */}
            {tab === 'experience' && (
              <>
                <button onClick={() => {
                  setModal({
                    isOpen: true,
                    title: 'Add Experience',
                    label: 'Company / Institution',
                    placeholder: 'Enter company name...',
                    onConfirm: async (company) => {
                      try {
                        await createExperience({ company, role: 'Role', description: 'Desc', location: 'Location', current: true, order: 99, tech_stack: [] });
                        refreshData();
                      } catch { toast.error('Failed'); }
                      setModal(null);
                    }
                  });
                }} className="btn-gradient px-4 py-2 rounded-lg text-sm mb-4 inline-flex items-center gap-2"><FiPlus/> New Experience</button>
                <div className="space-y-4">
                  {experiences.map((e) => (
                    <div key={e.id} className="glass p-4 flex justify-between items-start border-l-4 border-l-green-400">
                      <div className="w-full pr-4 flex flex-col gap-2">
                        <input className="bg-transparent font-bold text-white outline-none" value={e.company} 
                          onChange={(ev) => setExperiences(prev => prev.map(x => x.id === e.id ? { ...x, company: ev.target.value } : x))} 
                          onBlur={(ev) => apiUpdateExperience(e.id, { company: ev.target.value })} />
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                          <input className="bg-transparent text-sm text-cyan-400 outline-none w-full sm:flex-1" value={e.role} 
                            onChange={(ev) => setExperiences(prev => prev.map(x => x.id === e.id ? { ...x, role: ev.target.value } : x))} 
                            onBlur={(ev) => apiUpdateExperience(e.id, { role: ev.target.value })} />
                          <input className="bg-transparent text-xs text-gray-500 outline-none w-full sm:w-32" placeholder="Location" value={e.location || ''} 
                            onChange={(ev) => setExperiences(prev => prev.map(x => x.id === e.id ? { ...x, location: ev.target.value } : x))} 
                            onBlur={(ev) => apiUpdateExperience(e.id, { location: ev.target.value })} />
                        </div>
                        <textarea className="bg-transparent text-gray-400 text-sm whitespace-pre-wrap outline-none w-full h-20 resize-none" value={e.description} 
                          onChange={(ev) => setExperiences(prev => prev.map(x => x.id === e.id ? { ...x, description: ev.target.value } : x))} 
                          onBlur={(ev) => apiUpdateExperience(e.id, { description: ev.target.value })} />
                      </div>
                      <button onClick={() => deleteExperience(e.id).then(refreshData)} className="p-2 text-red-400"><FiTrash2 size={16}/></button>
                    </div>
                  ))}
                </div>
              </>
            )}

          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {modal?.isOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} className="glass max-w-md w-full p-6 relative">
              <button onClick={() => setModal(null)} className="absolute top-4 right-4 text-gray-400 hover:text-white"><FiX size={20}/></button>
              <h2 className="text-xl font-bold text-white mb-6">{modal.title}</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wide">{modal.label}</label>
                  <input autoFocus type="text" className="w-full bg-white/5 border border-white/10 rounded-lg text-sm text-gray-200 p-3 outline-none focus:border-cyan-400/50" placeholder={modal.placeholder} 
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const val = e.currentTarget.value.trim();
                        if (val) modal.onConfirm(val);
                      }
                    }}
                    id="modal-input"
                  />
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button onClick={() => setModal(null)} className="px-4 py-2 rounded-lg text-sm text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 transition-all border border-white/10">Cancel</button>
                  <button onClick={() => {
                    const input = document.getElementById('modal-input') as HTMLInputElement;
                    const val = input?.value.trim();
                    if (val) modal.onConfirm(val);
                  }} className="btn-gradient px-4 py-2 rounded-lg text-sm font-semibold">Confirm</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

/* ──────────────────────────────────────────────────────────────
   Extracted sub-components with local state for friendly editing
   ────────────────────────────────────────────────────────────── */

function SkillNameInput({ value, onSave }: { value: string; onSave: (v: string) => void }) {
  const [local, setLocal] = useState(value);
  useEffect(() => setLocal(value), [value]);
  return (
    <input
      className="bg-transparent text-white text-sm font-semibold outline-none w-full mb-2"
      value={local}
      onChange={(e) => setLocal(e.target.value)}
      onBlur={() => { if (local !== value) onSave(local); }}
    />
  );
}

function BlogCard({ blog: b, onUpdate, onDelete, onUpload, setBlogs }: {
  blog: any;
  onUpdate: (data: any) => Promise<any>;
  onDelete: () => void;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>, type: 'image'|'video') => Promise<string | null>;
  setBlogs: React.Dispatch<React.SetStateAction<any[]>>;
}) {
  // const [title, setTitle] = useState(b.title); // Removed local state
  // const [content, setContent] = useState(b.content || ''); // Removed local state
  // useEffect(() => { setTitle(b.title); setContent(b.content || ''); }, [b.title, b.content]); // Removed local state effect

  return (
    <div className="glass p-5 border-l-4 border-l-purple-500">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-2">
        <input
          className="bg-transparent text-lg font-bold text-white outline-none w-full sm:w-1/2"
          value={b.title}
          onChange={(e) => setBlogs(prev => prev.map(x => x.id === b.id ? { ...x, title: e.target.value } : x))}
          onBlur={(e) => onUpdate({ title: e.target.value })}
        />
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <select value={b.status} onChange={(e) => onUpdate({ status: e.target.value })} className="bg-white/10 text-xs rounded p-1 text-white border-none outline-none">
            <option value="draft">Draft</option><option value="published">Published</option>
          </select>
          <button onClick={() => onUpdate({ coming_soon: !b.coming_soon })} className={`text-xs px-2 py-1 rounded ${b.coming_soon ? 'bg-yellow-400/20 text-yellow-400' : 'bg-white/10 text-gray-400'}`}>Coming Soon</button>
          <button onClick={onDelete} className="text-red-400 ml-2"><FiTrash2 size={16}/></button>
        </div>
      </div>
      <textarea
        className="w-full bg-white/5 rounded p-3 text-sm text-gray-300 mb-2 h-16 focus:border-cyan-400/50 border border-white/10 outline-none"
        value={b.excerpt ?? ''}
        onChange={(e) => setBlogs(prev => prev.map(x => x.id === b.id ? { ...x, excerpt: e.target.value } : x))}
        onBlur={(e) => onUpdate({ excerpt: e.target.value })}
        placeholder="Short excerpt..."
      />
      <textarea
        className="w-full bg-white/5 rounded p-3 text-sm text-gray-300 mb-2 h-32 focus:border-cyan-400/50 border border-white/10 outline-none"
        value={b.content}
        onChange={(e) => setBlogs(prev => prev.map(x => x.id === b.id ? { ...x, content: e.target.value } : x))}
        onBlur={(e) => onUpdate({ content: e.target.value })}
        placeholder="Markdown content..."
      />
      <div className="flex gap-4 items-center mt-2">
        {b.cover_image && <img src={`http://localhost:8000${b.cover_image}`} className="h-10 rounded" alt="cover"/>}
        <label className="btn-gradient px-3 py-1.5 rounded text-xs cursor-pointer flex items-center gap-1"><FiImage/> Cover Image
          <input type="file" hidden accept="image/*" onChange={async (e) => { const url = await onUpload(e, 'image'); if (url) onUpdate({ cover_image: url }); }} />
        </label>
        <label className="border border-white/20 text-gray-300 hover:text-white px-3 py-1.5 rounded text-xs cursor-pointer flex items-center gap-1"><FiImage/> Insert Image
          <input type="file" hidden accept="image/*" onChange={async (e) => { 
            const url = await onUpload(e, 'image'); 
            if (url) {
              const md = `\n![image](http://localhost:8000${url})\n`;
              setBlogs(prev => prev.map(x => x.id === b.id ? { ...x, content: x.content + md } : x));
              onUpdate({ content: b.content + md });
            }
          }} />
        </label>
      </div>
    </div>
  );
}

function ProjectCard({ project: p, onUpdate, onDelete, onUpload, setProjects }: {
  project: any;
  onUpdate: (data: any) => Promise<any>;
  onDelete: () => void;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>, type: 'image'|'video') => Promise<string | null>;
  setProjects: React.Dispatch<React.SetStateAction<any[]>>;
}) {
  // const [title, setTitle] = useState(p.title); // Removed local state
  // const [desc, setDesc] = useState(p.description || ''); // Removed local state
  // useEffect(() => { setTitle(p.title); setDesc(p.description || ''); }, [p.title, p.description]); // Removed local state effect

  return (
    <div className="glass p-5 border-l-4 border-l-cyan-400">
      <div className="flex flex-col sm:flex-row justify-between gap-3 mb-3 border-b border-white/5 pb-2">
        <input
          className="bg-transparent text-lg font-bold text-white outline-none w-full sm:w-1/3"
          value={p.title}
          onChange={(e) => setProjects(prev => prev.map(x => x.id === p.id ? { ...x, title: e.target.value } : x))}
          onBlur={(e) => onUpdate({ title: e.target.value })}
        />
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <button onClick={() => onUpdate({ featured: !p.featured })} className={`text-xs px-2 py-1 rounded ${p.featured ? 'bg-cyan-400/20 text-cyan-400' : 'bg-white/10 text-gray-400'}`}>Featured</button>
          <button onClick={() => onUpdate({ coming_soon: !p.coming_soon })} className={`text-xs px-2 py-1 rounded ${p.coming_soon ? 'bg-yellow-400/20 text-yellow-400' : 'bg-white/10 text-gray-400'}`}>Coming Soon</button>
          <button onClick={onDelete} className="text-red-400 ml-2"><FiTrash2 size={16}/></button>
        </div>
      </div>
      <textarea
        className="w-full bg-transparent text-gray-400 text-sm h-16 outline-none border-b border-white/5 pb-2 mb-2"
        value={p.description ?? ''}
        onChange={(e) => setProjects(prev => prev.map(x => x.id === p.id ? { ...x, description: e.target.value } : x))}
        onBlur={(e) => onUpdate({ description: e.target.value })}
      />
      
      <div className="flex flex-col gap-3 mt-3 pt-3 border-t border-white/5">
        {/* Main Cover & Video */}
        <div className="flex flex-wrap gap-4 items-center">
          {p.image_url && <img src={`http://localhost:8000${p.image_url}`} className="h-8 rounded" alt="img"/>}
          <label className="text-xs text-blue-400 cursor-pointer flex items-center gap-1"><FiImage/> Main Image
            <input type="file" hidden accept="image/*" onChange={async (e) => { const url = await onUpload(e, 'image'); if (url) onUpdate({ image_url: url }); }} />
          </label>
          {p.video_url && <div className="text-xs text-green-400 flex items-center gap-1"><FiVideo/> Video attached</div>}
          <label className="text-xs text-purple-400 cursor-pointer flex items-center gap-1"><FiVideo/> Main Video
            <input type="file" hidden accept="video/*" onChange={async (e) => { const url = await onUpload(e, 'video'); if (url) onUpdate({ video_url: url }); }} />
          </label>
        </div>
        
        {/* Gallery Images */}
        <div className="pt-2 border-t border-white/5 flex flex-wrap items-center gap-2">
          <span className="text-xs text-gray-400 mono mr-2">Gallery:</span>
          {p.gallery?.map((img: string, idx: number) => (
             <div key={idx} className="relative group">
               <img src={`http://localhost:8000${img}`} className="h-10 w-10 object-cover rounded border border-white/10" alt="gallery"/>
               <button onClick={() => {
                 const newGallery = p.gallery.filter((_: any, i: number) => i !== idx);
                 onUpdate({ gallery: newGallery });
               }} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition"><FiTrash2 size={10}/></button>
             </div>
          ))}
          <label className="h-10 px-3 rounded border border-dashed border-white/20 text-xs text-gray-400 hover:text-white cursor-pointer flex items-center gap-1"><FiPlus/> Add Photo
            <input type="file" hidden multiple accept="image/*" onChange={async (e) => { 
              if (!e.target.files?.length) return;
              const newUrls = [];
              for(let i=0; i<e.target.files.length; i++){
                const url = await onUpload({ target: { files: [e.target.files[i]] } } as any, 'image');
                if (url) newUrls.push(url);
              }
              if (newUrls.length > 0) {
                onUpdate({ gallery: [...(p.gallery || []), ...newUrls] });
              }
            }} />
          </label>
        </div>
      </div>
    </div>
  );
}
