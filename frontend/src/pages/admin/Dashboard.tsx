import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiLogOut, FiTrash2, FiMail, FiCheck, FiCode, FiDatabase, FiSettings, FiEdit2, FiEdit3, FiMessageSquare, FiImage, FiVideo, FiPlus, FiBriefcase, FiX, FiCopy, FiExternalLink, FiLink, FiClock, FiHash } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import toast from 'react-hot-toast';
import {
  getMessages, markRead, deleteMessage,
  getProjects, createProject, updateProject, deleteProject,
  getSkills, createSkill, updateSkill as persistSkill, deleteSkill,
  getExperiences, createExperience, updateExperience as persistExperience, deleteExperience,
  getSettings, updateSettings,
  getAdminBlogs, createBlog, updateBlog, deleteBlog,
  getAllComments, approveComment, deleteComment,
  uploadFile, getSafeUrl
} from '../../api';

type TabType = 'messages' | 'settings' | 'blogs' | 'comments' | 'projects' | 'skills' | 'experience';

const countWords = (text: string | null | undefined) =>
  (text || '').trim().split(/\s+/).filter(Boolean).length;

const estimateReadingTime = (text: string | null | undefined) =>
  Math.max(1, Math.ceil(countWords(text) / 200));

const slugify = (text: string | null | undefined) =>
  (text || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const copyText = async (value: string, label: string) => {
  try {
    await navigator.clipboard.writeText(value);
    toast.success(`${label} copied`);
  } catch {
    toast.error(`Failed to copy ${label.toLowerCase()}`);
  }
};



const getBlogPublicUrl = (slug: string | null | undefined) => {
  if (!slug) return '';
  if (typeof window === 'undefined') return `/blog/${slug}`;
  return `${window.location.origin}/blog/${slug}`;
};

const CLIENT_IMAGE_LIMIT_BYTES = 10 * 1024 * 1024;
const SERVER_SAFE_IMAGE_LIMIT_BYTES = 1800 * 1024;

const loadImageElement = (file: File): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Failed to read image file.'));
    };

    image.src = objectUrl;
  });

const canvasToFile = (canvas: HTMLCanvasElement, fileName: string, mimeType: string, quality?: number): Promise<File> =>
  new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Failed to encode image.'));
        return;
      }

      resolve(new File([blob], fileName, { type: mimeType, lastModified: Date.now() }));
    }, mimeType, quality);
  });

const optimizeImageForUpload = async (file: File): Promise<File> => {
  if (file.size <= SERVER_SAFE_IMAGE_LIMIT_BYTES) {
    return file;
  }

  if (!['image/jpeg', 'image/png', 'image/webp', 'image/bmp'].includes(file.type)) {
    return file;
  }

  const image = await loadImageElement(file);
  const maxDimension = 2200;
  const scale = Math.min(1, maxDimension / Math.max(image.width, image.height));
  const width = Math.max(1, Math.round(image.width * scale));
  const height = Math.max(1, Math.round(image.height * scale));

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('Canvas is not available for image processing.');
  }

  context.drawImage(image, 0, 0, width, height);

  const sourceName = file.name.replace(/\.[^.]+$/, '');
  const preferredMimeType = file.type === 'image/png' ? 'image/webp' : 'image/jpeg';
  const preferredExtension = preferredMimeType === 'image/webp' ? 'webp' : 'jpg';

  let optimized = await canvasToFile(canvas, `${sourceName}.${preferredExtension}`, preferredMimeType, 0.82);

  if (optimized.size <= SERVER_SAFE_IMAGE_LIMIT_BYTES) {
    return optimized;
  }

  optimized = await canvasToFile(canvas, `${sourceName}.${preferredExtension}`, preferredMimeType, 0.7);

  return optimized.size < file.size ? optimized : file;
};

export default function AdminDashboard() {
  const { logoutFn } = useAuth();
  const { settings, refreshSettings } = useSettings();
  
  const [tab, setTab] = useState<TabType>('messages');
  const [loading, setLoading] = useState(false);
  const [loadedTabs, setLoadedTabs] = useState<Set<TabType>>(new Set());

  // Modal state for creating new items
  const [modal, setModal] = useState<{ isOpen: boolean; title: string; label: string; placeholder: string; onConfirm: (val: string) => void } | null>(null);

  // Data states
  const [messages, setMessages] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [skills, setSkills] = useState<any[]>([]);
  const [experiences, setExperiences] = useState<any[]>([]);
  const [blogs, setBlogs] = useState<any[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [activeBlogId, setActiveBlogId] = useState<number | null>(null);
  const [selectedMsg, setSelectedMsg] = useState<any | null>(null);
  const [showAddExpForm, setShowAddExpForm] = useState(false);
  const [editingExpId, setEditingExpId] = useState<number | null>(null);
  const [newExpData, setNewExpData] = useState({ 
    company: '', 
    description: '', 
    role: '', 
    location: '', 
    start_date: '', 
    end_date: '', 
    current: true,
    tech_stack: [] as string[],
    certificate_url: null as string | null,
    timeline_order: 0,
    milestone_year: '',
    featured: false,
    visual_layout: 'auto'
  });
  
  // Settings form with modern homepage key defaults
  const DEFAULT_SETTINGS: Record<string, string> = {
    home_name: 'Thimira Pathum',
    home_greeting: 'Portfolio Journey',
    home_roles: 'DevOps, MLOps, AI Integration, Linux Systems, Cloud Architecture',
    home_tag: 'Evolving from basic scripting to designing robust orchestration architectures.',
    home_description: 'Building modern digital solutions through software engineering, networking, and innovation. Passionate about systems that are purposeful, efficient, and future-ready.',
    profile_photo: '/profile.jpg',
    about_bio: 'I am Thimira Pathum, an Information and Communication Technology undergraduate at the University of Colombo whose career is defined by optimizing complex systems.\n\nMy professional roots as an award-winning industrial mechanic instilled a rigorous, hands-on approach to preventive maintenance and troubleshooting. I brought that analytical mindset into software engineering, and it now drives my journey into DevOps and MLOps.\n\nI thrive at the intersection of infrastructure and development — combining my expertise in custom Linux architectures, backend development (Java, Laravel), and networking to automate workflows, streamline deployments, and operationalize machine learning models.\n\nI am passionate about building resilient systems that bridge the gap between clean code and reliable production environments.',
    social_email: 'pathumt675@gmail.com',
    social_github: 'https://github.com/THIMIRAPATHUM',
    social_linkedin: 'https://linkedin.com/in/thimira-pathum',
  };

  const [settingForm, setSettingForm] = useState<Record<string, string>>(DEFAULT_SETTINGS);

  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  const loadTabData = useCallback(async (t: TabType, showSpinner = true) => {
    if (showSpinner) setLoading(true);
    try {
      switch (t) {
        case 'messages': {
          const res = await getMessages();
          setMessages(Array.isArray(res.data) ? res.data : []);
          break;
        }
        case 'settings': {
          const res = await getSettings();
          if (res.data) {
            setSettingForm({ ...DEFAULT_SETTINGS, ...res.data });
          }
          break;
        }
        case 'projects': {
          const res = await getProjects();
          setProjects(Array.isArray(res.data) ? res.data : []);
          break;
        }
        case 'skills': {
          const res = await getSkills();
          setSkills(Array.isArray(res.data) ? res.data : []);
          break;
        }
        case 'experience': {
          const res = await getExperiences();
          setExperiences(Array.isArray(res.data) ? res.data : []);
          break;
        }
        case 'blogs': {
          const res = await getAdminBlogs();
          setBlogs(Array.isArray(res.data) ? res.data : []);
          break;
        }
        case 'comments': {
          const res = await getAllComments();
          setComments(Array.isArray(res.data) ? res.data : []);
          break;
        }
      }
      setLoadedTabs(prev => new Set(prev).add(t));
    } catch (err: any) {
      console.error('Data load error:', err);
      const msg = err.response?.data?.message || err.message || 'Failed to load data';
      toast.error(`${msg} (${t})`);
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
          setMessages(Array.isArray(msgs.data) ? msgs.data : []);
          break;
        case 'projects':
          const projs = await getProjects();
          setProjects(Array.isArray(projs.data) ? projs.data : []);
          break;
        case 'skills':
          const skls = await getSkills();
          setSkills(Array.isArray(skls.data) ? skls.data : []);
          break;
        case 'experience':
          const exps = await getExperiences();
          setExperiences(Array.isArray(exps.data) ? exps.data : []);
          break;
        case 'blogs':
          const blgs = await getAdminBlogs();
          setBlogs(Array.isArray(blgs.data) ? blgs.data : []);
          break;
        case 'comments':
          const cmts = await getAllComments();
          setComments(Array.isArray(cmts.data) ? cmts.data : []);
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

  const handleFileUpload = async (file: File, type: 'image' | 'video' | 'document' = 'image') => {
    if (!file) return null;
    
    // Client-side validation
    const maxSize = type === 'video' ? 100 * 1024 * 1024 : CLIENT_IMAGE_LIMIT_BYTES; // 100MB for video, 10MB others
    if (file.size > maxSize) {
      toast.error(`File "${file.name}" is too large. Max size is ${Math.round(maxSize / (1024 * 1024))}MB`);
      return null;
    }

    const supportedTypes = {
      image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'image/bmp'],
      video: ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm', 'video/x-matroska'],
      document: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'application/zip']
    };

    if (type !== 'video' && !supportedTypes[type].includes(file.type)) {
      const kind = type === 'image' ? 'image' : 'document';
      toast.error(`Unsupported ${kind} type: ${file.type || file.name}. Please choose a supported file.`);
      return null;
    }

    let uploadCandidate = file;
    if (type === 'image') {
      try {
        uploadCandidate = await optimizeImageForUpload(file);
        if (uploadCandidate !== file) {
          toast.loading('Optimizing image for upload...', { id: 'upload' });
        }
      } catch (optimizationError) {
        console.warn('[Upload Optimization Error]:', optimizationError);
      }
    }

    setUploadProgress(0);
    toast.loading(`Uploading ${type}...`, { id: 'upload' });
    try {
      const response = await uploadFile(uploadCandidate, type as any, (progress) => {
        setUploadProgress(progress);
      });
      const url =
        typeof response.data?.url === 'string' && response.data.url.trim() !== ''
          ? response.data.url
          : typeof response.data?.path === 'string' && response.data.path.trim() !== ''
            ? `/storage/${response.data.path.replace(/^\/+/, '')}`
            : null;

      if (!url) {
        throw new Error('Upload succeeded but no file URL was returned.');
      }
      
      toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} uploaded successfully!`, { id: 'upload' });
      setUploadProgress(null);
      return url;
    } catch (error: any) {
      console.error('[Upload Error]:', error.response?.data || error.message);
      const rawServerMsg =
        error.response?.data?.errors?.file?.[0] ||
        error.response?.data?.message ||
        'Upload failed.';
      const serverMsg = rawServerMsg === 'No file found in request payload'
        ? 'Upload rejected by the server before Laravel received the file. Redeploy the backend with the new upload limits.'
        : rawServerMsg;
      toast.error(`${serverMsg} Check file type and size.`, { id: 'upload' });
      setUploadProgress(null);
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
          await createProject({ 
            title, 
            description: 'New project description...', 
            order: 0, 
            category: 'Web Development', 
            tech_stack: [], 
            featured: false, 
            coming_soon: false 
          });
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
          const created = await createBlog({ 
            title, 
            excerpt: 'New blog excerpt...', 
            content: 'Write your blog content here...', 
            status: 'draft', 
            coming_soon: false 
          });
          toast.success('Blog created as draft');
          await refreshData();
          setActiveBlogId(created.data?.id ?? null);
        } catch { toast.error('Failed'); }
        setModal(null);
      }
    });
  };

  async function apiUpdateSkill(id: number, data: any) {
    try {
      await persistSkill(id, data);
    } catch (err: any) {
      console.error('Skill update error:', err);
      toast.error('Failed to update skill');
      refreshData();
    }
  }

  async function handleUpdateSkill(id: number, data: any) {
    setSkills(s => s.map(x => x.id === id ? { ...x, ...data } : x));
    await apiUpdateSkill(id, data);
  }

  async function apiUpdateExperience(id: number, data: any) {
    try {
      await persistExperience(id, data);
    } catch (err: any) {
      console.error('Experience update error:', err);
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
    { key: 'experience', label: 'Education & Certifications', icon: FiBriefcase },
  ];

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const visibleMessages = messages;
  const visibleBlogs = blogs;
  const visibleComments = comments;
  const visibleProjects = projects;
  const visibleSkills = skills;
  const visibleExperiences = experiences;

  return (
    <main className="pt-16 sm:pt-24 pb-20 px-4 sm:px-6 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Mobile Header (Visible only on small screens) */}
        <div className="sm:hidden flex items-center justify-between mb-6 bg-white/5 border border-white/10 p-4 rounded-xl backdrop-blur-md">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></div>
            <span className="text-white font-bold text-sm">Dashboard</span>
          </div>
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 text-cyan-400 hover:bg-cyan-400/10 rounded-lg transition-colors"
          >
            {isMenuOpen ? <FiX size={20} /> : <FiSettings size={20} />}
          </button>
        </div>

        {/* Mobile Navigation Dropdown */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="sm:hidden absolute left-4 right-4 z-50 bg-gray-900/95 border border-white/10 p-4 rounded-xl backdrop-blur-xl shadow-2xl space-y-1 mb-6"
            >
              {tabs.map(({ key, label, icon: Icon }) => (
                <button 
                  key={key} 
                  onClick={() => { setTab(key); setIsMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all ${
                    tab === key ? 'bg-cyan-400/20 text-cyan-400 font-bold' : 'text-gray-400 hover:bg-white/5'
                  }`}
                >
                  <Icon size={16} /> {label}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Desktop/Tablet Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="mono text-xs text-cyan-400 mb-2">{'>'} admin.dashboard()</div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Full <span className="gradient-text">CMS Dashboard</span></h1>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 text-gray-400 hover:text-white transition-all text-sm">
            <FiLogOut size={15} /> Logout
          </button>
        </div>

        {/* Desktop Tabs (Hidden on mobile) */}
        <div className="hidden sm:flex flex-wrap gap-2 mb-6 border-b border-white/5 pb-4">
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
            {tab === 'messages' && Array.isArray(visibleMessages) && visibleMessages.map((msg) => (
              <div 
                key={msg.id} 
                className={`glass p-5 flex items-start gap-4 transition-all hover:bg-white/5 cursor-pointer ${!msg.read ? 'border-cyan-400/30' : ''}`}
                onClick={() => {
                  setSelectedMsg(msg);
                  if (!msg.read) {
                    markRead(msg.id).then(refreshData);
                  }
                }}
              >
                <div className="flex-1">
                  <div className="flex gap-2 mb-1"><span className="font-semibold text-white text-sm">{msg.name}</span><span className="text-gray-500 text-xs mono">{msg.email}</span></div>
                  <div className="text-cyan-400 text-xs mb-2 font-medium">{msg.subject}</div>
                  <p className="text-gray-400 text-sm line-clamp-2">{msg.message}</p>
                </div>
                <div className="flex gap-2">
                  <a
                    href={`mailto:${msg.email}?subject=${encodeURIComponent(`Re: ${msg.subject || 'Your message'}`)}`}
                    className="p-2 text-purple-400 hover:bg-purple-400/10 rounded"
                    title={`Email ${msg.email}`}
                    aria-label={`Email ${msg.email}`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <FiMail />
                  </a>
                  {!msg.read && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        markRead(msg.id).then(refreshData);
                      }} 
                      className="p-2 text-cyan-400 hover:bg-cyan-400/10 rounded"
                    >
                      <FiCheck />
                    </button>
                  )}
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteMessage(msg.id).then(refreshData);
                    }} 
                    className="p-2 text-red-400 hover:bg-red-400/10 rounded"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            ))}
            {tab === 'messages' && visibleMessages.length === 0 && <div className="glass p-8 text-center text-gray-500">No messages yet</div>}

            {/* SETTINGS TAB */}
            {tab === 'settings' && (
              <div className="glass p-6 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/10 pb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white">Homepage & Site Content Management</h3>
                    <p className="text-xs text-gray-400 mt-1">Directly edit all hero details, about me paragraphs, and social links for your portfolio.</p>
                  </div>
                  <button onClick={handleSaveSettings} className="btn-gradient px-6 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2">
                    <FiCheck /> Save All Settings
                  </button>
                </div>

                {/* Profile Photo Upload */}
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5 space-y-4">
                  <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                    <FiImage className="text-cyan-400" /> Profile Photo (Hero & About Header)
                  </h4>
                  <div className="flex flex-col sm:flex-row items-center gap-6">
                    {(settingForm.profile_photo || settings.profile_photo) ? (
                      <img 
                        src={getSafeUrl(settingForm.profile_photo || settings.profile_photo)} 
                        alt="Profile Preview" 
                        className="w-24 h-24 rounded-full object-cover border-2 border-cyan-400/40 shadow-lg"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = '/profile.jpg';
                        }}
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-500">
                        <FiImage size={32} />
                      </div>
                    )}
                    <div className="space-y-2 text-center sm:text-left">
                      <label className="btn-gradient px-5 py-2.5 rounded-lg text-xs font-semibold cursor-pointer inline-flex items-center gap-2">
                        <FiImage /> Upload New Profile Picture
                        <input 
                          type="file" 
                          className="hidden" 
                          accept="image/*"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                               const url = await handleFileUpload(file, 'image');
                               if (url) {
                                 const updated = { ...settingForm, profile_photo: url };
                                 setSettingForm(updated);
                                 try {
                                   await updateSettings(updated);
                                   await refreshSettings();
                                   toast.success('Profile photo updated & saved!');
                                 } catch {
                                   toast.error('Failed to save profile photo setting');
                                 }
                               }
                            }
                          }}
                        />
                      </label>
                      <p className="text-xs text-gray-400">Upload a high quality portrait photo (JPG, PNG, WebP).</p>
                    </div>
                  </div>
                </div>

                {/* Hero Section - Matching Photo 1 */}
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5 space-y-4">
                  <div className="border-b border-white/5 pb-2">
                    <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                      <FiCode className="text-cyan-400" /> Hero Section (Photo 1)
                    </h4>
                    <p className="text-xs text-gray-400">Edit the primary headline, description, greeting, and typewriter roles.</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-400 mono mb-1 uppercase tracking-wider">Full Name (Hero Headline)</label>
                      <input 
                        type="text" 
                        value={settingForm.home_name || ''} 
                        onChange={(e) => setSettingForm({ ...settingForm, home_name: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl text-sm text-white p-3 focus:border-cyan-400/50 outline-none"
                        placeholder="Thimira Pathum"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mono mb-1 uppercase tracking-wider">Greeting Badge Text</label>
                      <input 
                        type="text" 
                        value={settingForm.home_greeting || ''} 
                        onChange={(e) => setSettingForm({ ...settingForm, home_greeting: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl text-sm text-white p-3 focus:border-cyan-400/50 outline-none"
                        placeholder="Portfolio Journey"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-400 mono mb-1 uppercase tracking-wider">Typewriter Roles (Comma Separated)</label>
                      <input 
                        type="text" 
                        value={settingForm.home_roles || ''} 
                        onChange={(e) => setSettingForm({ ...settingForm, home_roles: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl text-sm text-white p-3 focus:border-cyan-400/50 outline-none"
                        placeholder="DevOps, MLOps, AI Integration, Linux Systems, Cloud Architecture"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mono mb-1 uppercase tracking-wider">Sub-Tagline</label>
                      <input 
                        type="text" 
                        value={settingForm.home_tag || ''} 
                        onChange={(e) => setSettingForm({ ...settingForm, home_tag: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl text-sm text-white p-3 focus:border-cyan-400/50 outline-none"
                        placeholder="Evolving from basic scripting to designing robust orchestration architectures."
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-gray-400 mono mb-1 uppercase tracking-wider">Hero Description Paragraph (Photo 1 Text)</label>
                    <textarea 
                      value={settingForm.home_description || ''} 
                      onChange={(e) => setSettingForm({ ...settingForm, home_description: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl text-sm text-white p-3 h-28 focus:border-cyan-400/50 outline-none resize-none"
                      placeholder="Building modern digital solutions through software engineering, networking, and innovation..."
                    />
                  </div>
                </div>

                {/* About Section - Matching Photo 2 */}
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5 space-y-4">
                  <div className="border-b border-white/5 pb-2">
                    <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                      <FiEdit3 className="text-cyan-400" /> About Me Section (Photo 2)
                    </h4>
                    <p className="text-xs text-gray-400">Write your multi-paragraph bio text. Separate paragraphs with a blank line.</p>
                  </div>

                  <div>
                    <label className="block text-xs text-gray-400 mono mb-1 uppercase tracking-wider">About Me Full Bio (Photo 2 Paragraphs)</label>
                    <textarea 
                      value={settingForm.about_bio || ''} 
                      onChange={(e) => setSettingForm({ ...settingForm, about_bio: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl text-sm text-white p-3 h-48 focus:border-cyan-400/50 outline-none resize-y"
                      placeholder="I am Thimira Pathum, an Information and Communication Technology undergraduate..."
                    />
                  </div>
                </div>

                {/* Contact Details & Social Links */}
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5 space-y-4">
                  <div className="border-b border-white/5 pb-2">
                    <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                      <FiMail className="text-cyan-400" /> Contact Email & Social Media
                    </h4>
                    <p className="text-xs text-gray-400">Update your email and social profiles for contact links.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs text-gray-400 mono mb-1 uppercase tracking-wider">Contact Email</label>
                      <input 
                        type="email" 
                        value={settingForm.social_email || ''} 
                        onChange={(e) => setSettingForm({ ...settingForm, social_email: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl text-sm text-white p-3 focus:border-cyan-400/50 outline-none"
                        placeholder="pathumt675@gmail.com"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mono mb-1 uppercase tracking-wider">GitHub URL</label>
                      <input 
                        type="url" 
                        value={settingForm.social_github || ''} 
                        onChange={(e) => setSettingForm({ ...settingForm, social_github: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl text-sm text-white p-3 focus:border-cyan-400/50 outline-none"
                        placeholder="https://github.com/THIMIRAPATHUM"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mono mb-1 uppercase tracking-wider">LinkedIn URL</label>
                      <input 
                        type="url" 
                        value={settingForm.social_linkedin || ''} 
                        onChange={(e) => setSettingForm({ ...settingForm, social_linkedin: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl text-sm text-white p-3 focus:border-cyan-400/50 outline-none"
                        placeholder="https://linkedin.com/in/thimira-pathum"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button onClick={handleSaveSettings} className="btn-gradient px-8 py-3 rounded-xl text-sm font-semibold flex items-center gap-2">
                    <FiCheck /> Save All Settings
                  </button>
                </div>
              </div>
            )}

            {/* BLOGS TAB */}
            {tab === 'blogs' && (
              <>
                {activeBlogId === null ? (
                  <>
                    <button onClick={handleCreateBlog} className="btn-gradient px-4 py-2 rounded-lg text-sm mb-4 inline-flex items-center gap-2"><FiPlus/> New Blog</button>
                    {Array.isArray(visibleBlogs) && visibleBlogs.map((b) => (
                    <div key={b.id} onClick={() => setActiveBlogId(b.id)}>
                      <BlogCard blog={b} onUpdate={(data) => updateBlog(b.id, data).then(refreshData)} onDelete={() => deleteBlog(b.id).then(refreshData)} onUpload={handleFileUpload} setBlogs={setBlogs} compact getSafeUrl={getSafeUrl} />
                    </div>
                    ))}
                    {visibleBlogs.length === 0 && <div className="glass p-8 text-center text-gray-500">No blog posts yet</div>}
                  </>
                ) : (
                  <div className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm overflow-auto">
                    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20">
                      <div className="flex items-center justify-between mb-4">
                        <div className="mono text-xs text-cyan-400">{'>'} blog.editor()</div>
                        <button onClick={() => setActiveBlogId(null)} className="px-4 py-2 rounded-lg text-sm text-gray-300 hover:text-white bg-white/5 border border-white/10">Back to list</button>
                      </div>
                      {blogs.filter(b => b.id === activeBlogId).map((b) => (
                        <BlogCard
                          key={b.id}
                          blog={b}
                          onUpdate={(data) => updateBlog(b.id, data).then(refreshData)}
                          onDelete={() => { deleteBlog(b.id).then(refreshData); setActiveBlogId(null); }}
                          onUpload={handleFileUpload}
                          setBlogs={setBlogs}
                          full
                          onClose={() => setActiveBlogId(null)}
                          getSafeUrl={getSafeUrl}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* COMMENTS TAB */}
            {tab === 'comments' && Array.isArray(visibleComments) && visibleComments.map((c) => (
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
            {tab === 'comments' && visibleComments.length === 0 && <div className="glass p-8 text-center text-gray-500">No comments yet</div>}

            {/* PROJECTS TAB */}
            {tab === 'projects' && (
              <>
                <button onClick={handleCreateProject} className="btn-gradient px-4 py-2 rounded-lg text-sm mb-4 inline-flex items-center gap-2"><FiPlus/> New Project</button>
                {Array.isArray(visibleProjects) && visibleProjects.map((p) => (
                  <ProjectCard key={p.id} project={p} onUpdate={(data) => updateProject(p.id, data).then(refreshData)} onDelete={() => deleteProject(p.id).then(refreshData)} onUpload={handleFileUpload} setProjects={setProjects} getSafeUrl={getSafeUrl} />
                ))}
                {visibleProjects.length === 0 && <div className="glass p-8 text-center text-gray-500">No projects yet</div>}
              </>
            )}

            {/* SKILLS TAB */}
            {tab === 'skills' && (
              <>
                <button onClick={handleCreateSkill} className="btn-gradient px-4 py-2 rounded-lg text-sm mb-4 inline-flex items-center gap-2"><FiPlus/> New Skill</button>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Array.isArray(visibleSkills) && visibleSkills.map((s) => (
                    <div key={s.id} className="glass p-5 transition-all hover:bg-white/5 border-white/5 group relative overflow-hidden">
                      <div className="flex justify-between items-start mb-6">
                        <div className="flex-1 space-y-4">
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.5)]" />
                            <input 
                              className="bg-transparent text-white font-bold text-base outline-none w-full border-b border-white/5 focus:border-cyan-400/30 pb-1"
                              value={s.name}
                              onChange={(e) => setSkills(prev => prev.map(x => x.id === s.id ? { ...x, name: e.target.value } : x))}
                              onBlur={() => handleUpdateSkill(s.id, { name: s.name })}
                            />
                          </div>
                          
                          <div className="grid grid-cols-1 gap-4">
                            <div>
                              <label className="block text-[10px] text-gray-500 mono uppercase mb-1 tracking-widest">Category</label>
                              <input 
                                className="w-full bg-white/5 border border-white/10 rounded-lg text-xs text-gray-300 p-2.5 outline-none focus:border-cyan-400/30"
                                value={s.category}
                                placeholder="e.g. Frontend, Backend, Tools"
                                onChange={(e) => setSkills(prev => prev.map(x => x.id === s.id ? { ...x, category: e.target.value } : x))}
                                onBlur={() => handleUpdateSkill(s.id, { category: s.category })}
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-[10px] text-gray-500 mono uppercase mb-1 tracking-widest">Icon</label>
                                <input
                                  className="w-full bg-white/5 border border-white/10 rounded-lg text-xs text-gray-300 p-2.5 outline-none focus:border-cyan-400/30"
                                  value={s.icon || ''}
                                  placeholder="e.g. react"
                                  onChange={(e) => setSkills(prev => prev.map(x => x.id === s.id ? { ...x, icon: e.target.value } : x))}
                                  onBlur={() => handleUpdateSkill(s.id, { icon: s.icon || '' })}
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] text-gray-500 mono uppercase mb-1 tracking-widest">Order</label>
                                <input
                                  type="number"
                                  className="w-full bg-white/5 border border-white/10 rounded-lg text-xs text-gray-300 p-2.5 outline-none focus:border-cyan-400/30"
                                  value={s.order ?? 0}
                                  onChange={(e) => setSkills(prev => prev.map(x => x.id === s.id ? { ...x, order: Number(e.target.value) } : x))}
                                  onBlur={() => handleUpdateSkill(s.id, { order: s.order ?? 0 })}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                        <button onClick={() => deleteSkill(s.id).then(refreshData)} className="p-2 text-gray-500 hover:text-red-400 transition-colors ml-2"><FiTrash2 size={16}/></button>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-[10px] mono text-gray-400 uppercase mb-2">
                             <span>Proficiency <span className="text-[8px] lowercase italic opacity-50 px-1">(used for badge labels)</span></span>
                             <span className="text-cyan-400 font-bold">{s.level}%</span>
                          </div>
                          <input 
                            type="range" 
                            min="0" 
                            max="100" 
                            value={s.level} 
                            onChange={(e) => handleUpdateSkill(s.id, { level: Number(e.target.value) })} 
                            className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                          />
                        </div>
                      </div>

                    </div>
                  ))}
                </div>
                {visibleSkills.length === 0 && <div className="glass p-8 text-center text-gray-500">No skills yet</div>}
              </>
            )}

            {/* EDUCATION & CERTS TAB */}
            {tab === 'experience' && (
              <>
                <button 
                  onClick={() => {
                    setShowAddExpForm(!showAddExpForm);
                    setEditingExpId(null);
                    setNewExpData({ 
                      company: '', description: '', role: '', location: '', 
                      start_date: '', end_date: '', current: true, tech_stack: [], certificate_url: null,
                      timeline_order: 0, milestone_year: '', featured: false, visual_layout: 'auto'
                    });
                  }} 
                  className={`btn-gradient px-4 py-2 rounded-lg text-sm mb-4 inline-flex items-center gap-2 transition-all ${showAddExpForm && !editingExpId ? 'bg-red-500/20 text-red-400 border-red-500/30' : ''}`}
                >
                  {showAddExpForm && !editingExpId ? <><FiX/> Cancel</> : <><FiPlus/> Add New</>}
                </button>

                {showAddExpForm && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="glass p-6 mb-6 border-cyan-400/30">
                    <h3 className="text-white font-bold mb-6">{editingExpId ? 'Edit' : 'Add New'} Education / Certification</h3>
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] text-gray-500 mono mb-1 uppercase tracking-widest">Topic / Institution</label>
                          <input 
                            autoFocus
                            type="text" 
                            placeholder="e.g. University Name or Certification Title"
                            className="w-full bg-white/5 border border-white/10 rounded-lg text-sm text-gray-200 p-3 outline-none focus:border-cyan-400/50"
                            value={newExpData.company}
                            onChange={(e) => setNewExpData({ ...newExpData, company: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-gray-500 mono mb-1 uppercase tracking-widest">Program / Certificate Type</label>
                          <input 
                            type="text" 
                            placeholder="e.g. Bachelor of Science / AWS Solutions Architect"
                            className="w-full bg-white/5 border border-white/10 rounded-lg text-sm text-gray-200 p-3 outline-none focus:border-cyan-400/50"
                            value={newExpData.role}
                            onChange={(e) => setNewExpData({ ...newExpData, role: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-[10px] text-gray-500 mono mb-1 uppercase tracking-widest">Location</label>
                          <input 
                            type="text" 
                            placeholder="City, Country"
                            className="w-full bg-white/5 border border-white/10 rounded-lg text-sm text-gray-200 p-3 outline-none focus:border-cyan-400/50"
                            value={newExpData.location}
                            onChange={(e) => setNewExpData({ ...newExpData, location: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-gray-500 mono mb-1 uppercase tracking-widest">Start Date</label>
                          <input 
                            type="date" 
                            className="w-full bg-white/5 border border-white/10 rounded-lg text-sm text-gray-200 p-2.5 outline-none focus:border-cyan-400/50"
                            value={newExpData.start_date}
                            onChange={(e) => setNewExpData({ ...newExpData, start_date: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-gray-500 mono mb-1 uppercase tracking-widest">End Date</label>
                          <input 
                            type="date" 
                            disabled={newExpData.current}
                            className={`w-full bg-white/5 border border-white/10 rounded-lg text-sm text-gray-200 p-2.5 outline-none focus:border-cyan-400/50 ${newExpData.current ? 'opacity-50' : ''}`}
                            value={newExpData.end_date}
                            onChange={(e) => setNewExpData({ ...newExpData, end_date: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-[10px] text-[var(--text-secondary)] mono mb-1 uppercase tracking-widest">Milestone Year (Label)</label>
                          <input 
                            type="text" 
                            placeholder="e.g. 2020-2022 or 2024"
                            className="w-full bg-[rgba(232,116,29,0.04)] border border-[var(--border)] rounded-lg text-sm text-[var(--text-primary)] p-3 outline-none focus:border-[var(--accent-primary)]/50"
                            value={newExpData.milestone_year || ''}
                            onChange={(e) => setNewExpData({ ...newExpData, milestone_year: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-[var(--text-secondary)] mono mb-1 uppercase tracking-widest">Timeline Order</label>
                          <input 
                            type="number" 
                            className="w-full bg-[rgba(232,116,29,0.04)] border border-[var(--border)] rounded-lg text-sm text-[var(--text-primary)] p-2.5 outline-none focus:border-[var(--accent-primary)]/50"
                            value={newExpData.timeline_order ?? 0}
                            onChange={(e) => setNewExpData({ ...newExpData, timeline_order: Number(e.target.value) })}
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-[var(--text-secondary)] mono mb-1 uppercase tracking-widest">Visual Layout</label>
                          <select 
                            className="w-full bg-[rgba(232,116,29,0.04)] border border-[var(--border)] rounded-lg text-sm text-[var(--text-primary)] p-2.5 outline-none focus:border-[var(--accent-primary)]/50"
                            value={newExpData.visual_layout || 'auto'}
                            onChange={(e) => setNewExpData({ ...newExpData, visual_layout: e.target.value })}
                          >
                            <option value="auto">Auto (Alternate)</option>
                            <option value="left-text">Text Left / Image Right</option>
                            <option value="right-text">Image Left / Text Right</option>
                          </select>
                        </div>
                      </div>

                      <div className="flex flex-col md:flex-row gap-6 items-start">
                        <div className="flex items-center gap-4 pt-6">
                          <div className="flex items-center gap-2">
                            <input 
                              type="checkbox" 
                              id="is_current"
                              className="accent-[var(--accent-primary)] w-4 h-4 cursor-pointer"
                              checked={newExpData.current}
                              onChange={(e) => setNewExpData({ ...newExpData, current: e.target.checked })}
                            />
                            <label htmlFor="is_current" className="text-xs text-[var(--text-primary)] cursor-pointer">Currently enrolled / active</label>
                          </div>
                          <div className="flex items-center gap-2">
                            <input 
                              type="checkbox" 
                              id="is_featured"
                              className="accent-[var(--accent-primary)] w-4 h-4 cursor-pointer"
                              checked={newExpData.featured || false}
                              onChange={(e) => setNewExpData({ ...newExpData, featured: e.target.checked })}
                            />
                            <label htmlFor="is_featured" className="text-xs text-[var(--text-primary)] cursor-pointer font-semibold">Featured Milestone</label>
                          </div>
                        </div>
                        <div className="flex-1 w-full">
                          <label className="block text-[10px] text-gray-500 mono mb-1 uppercase tracking-widest">Tech Stack / Skills (comma separated)</label>
                          <input 
                            type="text" 
                            placeholder="e.g. React, Docker, UI/UX"
                            className="w-full bg-white/5 border border-white/10 rounded-lg text-sm text-gray-200 p-3 outline-none focus:border-cyan-400/50"
                            onChange={(e) => setNewExpData({ ...newExpData, tech_stack: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                          />
                        </div>
                      </div>

                      <div className="flex flex-col md:flex-row gap-6 items-start">
                        <div className="flex-1 w-full">
                          <label className="block text-[10px] text-gray-500 mono mb-1 uppercase tracking-widest">Description</label>
                          <textarea 
                            placeholder="Describe your achievement or program details..."
                            className="w-full bg-white/5 border border-white/10 rounded-lg text-sm text-gray-200 p-3 outline-none focus:border-cyan-400/50 h-24 resize-none"
                            value={newExpData.description}
                            onChange={(e) => setNewExpData({ ...newExpData, description: e.target.value })}
                          />
                        </div>
                        <div className="w-full md:w-64">
                          <label className="block text-[10px] text-gray-500 mono mb-1 uppercase tracking-widest">Certificate / Proof</label>
                          <div className="mt-2 flex flex-col gap-3">
                            <label className="btn-gradient px-4 py-3 rounded-lg text-sm cursor-pointer flex items-center justify-center gap-2 hover:opacity-90 transition-all border border-white/10">
                              <FiImage size={16} /> {newExpData.certificate_url ? 'Change File' : 'Upload Multi-Media'}
                              <input 
                                type="file" 
                                hidden 
                                accept="image/*,application/pdf" 
                                onChange={async (ev) => {
                                  const file = ev.target.files?.[0];
                                  if (!file) return;
                                  const isPdf = file.type === 'application/pdf';
                                  const url = await handleFileUpload(file, isPdf ? 'document' : 'image');
                                  if (url) {
                                    setNewExpData({ ...newExpData, certificate_url: url });
                                    toast.success('File uploaded');
                                  }
                                }} 
                      />
                            </label>

                            {newExpData.certificate_url && (
                              <div className="glass p-3 rounded-lg border-cyan-400/20 flex items-center justify-between group">
                                <div className="flex items-center gap-2 overflow-hidden">
                                  {newExpData.certificate_url.toLowerCase().endsWith('.pdf') ? (
                                    <FiMessageSquare className="text-red-400 shrink-0" size={20} />
                                  ) : (
                                    <img 
                                      src={getSafeUrl(newExpData.certificate_url)} 
                                      className="h-10 w-10 object-cover rounded shrink-0" 
                                      alt="preview"
                                      onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/40?text=Error')}
                                    />
                                  )}
                                  <span className="text-[10px] text-gray-400 truncate max-w-[100px]">Attached</span>
                                </div>
                                <button 
                                  onClick={() => setNewExpData({ ...newExpData, certificate_url: null })}
                                  className="text-gray-500 hover:text-red-400 p-1"
                                >
                                  <FiX size={14}/>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                        <button onClick={() => { setShowAddExpForm(false); setEditingExpId(null); }} className="px-5 py-2 rounded-lg text-sm text-gray-400 hover:text-white transition-all">Cancel</button>
                        <button 
                          onClick={async () => {
                            if (!newExpData.company.trim()) {
                              toast.error('Topic/Institution is required');
                              return;
                            }
                            if (!newExpData.start_date) {
                              toast.error('Start date is required');
                              return;
                            }
                            try {
                              if (editingExpId) {
                                await apiUpdateExperience(editingExpId, newExpData);
                                toast.success('Updated successfully');
                              } else {
                                await createExperience({ ...newExpData, order: 99 });
                                toast.success('Added successfully');
                              }
                              setNewExpData({ 
                                company: '', description: '', role: '', location: '', 
                                start_date: '', end_date: '', current: true, tech_stack: [], certificate_url: null,
                                timeline_order: 0, milestone_year: '', featured: false, visual_layout: 'auto'
                              });
                              setShowAddExpForm(false);
                              setEditingExpId(null);
                              refreshData();
                            } catch { toast.error(editingExpId ? 'Failed to update' : 'Failed to add'); }
                          }} 
                          className="btn-gradient px-8 py-2 rounded-lg text-sm font-semibold"
                        >
                          {editingExpId ? 'Save Changes' : 'Add Certification'}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}

                <div className="space-y-4">
                  {Array.isArray(visibleExperiences) && visibleExperiences.map((e) => (
                    <div key={e.id} className={`glass p-4 flex justify-between items-start border-l-4 transition-all ${e.current ? 'border-l-green-400' : 'border-l-gray-600'}`}>
                      <div className="w-full pr-4 flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <input className="bg-transparent font-bold text-white outline-none flex-1" value={e.company} 
                            onChange={(ev) => setExperiences(prev => prev.map(x => x.id === e.id ? { ...x, company: ev.target.value } : x))} 
                            onBlur={(ev) => apiUpdateExperience(e.id, { company: ev.target.value })} />
                          
                          <div className="flex items-center gap-3">
                            <button 
                              onClick={() => {
                                setEditingExpId(e.id);
                                setNewExpData({
                                    company: e.company,
                                    description: e.description,
                                    role: e.role,
                                    location: e.location || '',
                                    start_date: e.start_date?.split('T')[0] || '',
                                    end_date: e.end_date?.split('T')[0] || '',
                                    current: e.current,
                                    tech_stack: e.tech_stack || [],
                                    certificate_url: e.certificate_url,
                                    timeline_order: e.timeline_order ?? 0,
                                    milestone_year: e.milestone_year || '',
                                    featured: e.featured || false,
                                    visual_layout: e.visual_layout || 'auto'
                                  });
                                setShowAddExpForm(true);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                              }}
                              className="p-1 px-2 rounded bg-white/5 hover:bg-white/10 text-cyan-400 hover:text-cyan-300 transition-all flex items-center gap-1 text-[10px]"
                            >
                              <FiEdit2 size={10}/> Edit
                            </button>
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                          <input className="bg-transparent text-sm text-cyan-400 outline-none w-full sm:flex-1" value={e.role} 
                            onChange={(ev) => setExperiences(prev => prev.map(x => x.id === e.id ? { ...x, role: ev.target.value } : x))} 
                            onBlur={(ev) => apiUpdateExperience(e.id, { role: ev.target.value })} />
                          <input className="bg-transparent text-xs text-gray-500 outline-none w-full sm:w-32" placeholder="Location" value={e.location || ''} 
                            onChange={(ev) => setExperiences(prev => prev.map(x => x.id === e.id ? { ...x, location: ev.target.value } : x))} 
                            onBlur={(ev) => apiUpdateExperience(e.id, { location: ev.target.value })} />
                          <input className="bg-transparent text-xs text-gray-500 outline-none w-full sm:w-20" type="number" placeholder="Order" value={e.order ?? 0}
                            onChange={(ev) => setExperiences(prev => prev.map(x => x.id === e.id ? { ...x, order: Number(ev.target.value) } : x))}
                            onBlur={(ev) => apiUpdateExperience(e.id, { order: Number(ev.target.value) })} />
                        </div>
                        <textarea className="bg-transparent text-gray-400 text-sm whitespace-pre-wrap outline-none w-full h-20 resize-none" value={e.description} 
                          onChange={(ev) => setExperiences(prev => prev.map(x => x.id === e.id ? { ...x, description: ev.target.value } : x))} 
                          onBlur={(ev) => apiUpdateExperience(e.id, { description: ev.target.value })} />
                        <input
                          className="bg-white/5 border border-white/10 rounded-lg text-xs text-gray-300 p-2.5 outline-none focus:border-cyan-400/30"
                          value={(e.tech_stack || []).join(', ')}
                          placeholder="Tech stack, comma separated"
                          onChange={(ev) => setExperiences(prev => prev.map(x => x.id === e.id ? { ...x, tech_stack: ev.target.value.split(',').map((item: string) => item.trim()).filter(Boolean) } : x))}
                          onBlur={(ev) => apiUpdateExperience(e.id, { tech_stack: ev.target.value.split(',').map((item: string) => item.trim()).filter(Boolean) })}
                        />
                        
                        {/* Certificate Upload & Preview */}
                        <div className="flex items-center gap-3 mt-1 pt-2 border-t border-white/5">
                          <label className="text-[10px] text-cyan-400 cursor-pointer flex items-center gap-1 hover:text-cyan-300 transition-colors">
                            <FiImage size={10} /> {e.certificate_url ? 'Change Certificate' : 'Upload Certificate'}
                            <input 
                              type="file" 
                              hidden 
                              accept="image/*,application/pdf" 
                              onChange={async (ev) => {
                                const file = ev.target.files?.[0];
                                if (!file) return;
                                const isPdf = file.type === 'application/pdf';
                                const url = await handleFileUpload(file, isPdf ? 'document' : 'image');
                                if (url) {
                                  const updated = { ...e, certificate_url: url };
                                  setExperiences(prev => prev.map(x => x.id === e.id ? updated : x));
                                  apiUpdateExperience(e.id, { certificate_url: url });
                                }
                              }} 
                            />
                          </label>

                          {e.certificate_url && (
                            <div className="flex items-center gap-2">
                              {e.certificate_url.toLowerCase().endsWith('.pdf') ? (
                                <a href={getSafeUrl(e.certificate_url)} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[10px] text-red-400 hover:text-red-300">
                                  <FiMessageSquare size={10} /> View PDF
                                </a>
                              ) : (
                                <div className="relative group">
                                  <img src={getSafeUrl(e.certificate_url)} className="h-6 w-8 object-cover rounded border border-white/10" alt="cert"/>
                                  <div className="absolute inset-0 bg-black/60 hidden group-hover:flex items-center justify-center rounded transition-all cursor-pointer" onClick={() => window.open(getSafeUrl(e.certificate_url), '_blank')}>
                                    <FiImage size={10} className="text-white" />
                                  </div>
                                </div>
                              )}
                              <button 
                                onClick={() => {
                                  const updated = { ...e, certificate_url: null };
                                  setExperiences(prev => prev.map(x => x.id === e.id ? updated : x));
                                  apiUpdateExperience(e.id, { certificate_url: null });
                                }}
                                className="text-[10px] text-gray-500 hover:text-red-400"
                              >
                                Remove
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                      <button onClick={() => deleteExperience(e.id).then(refreshData)} className="p-2 text-red-400"><FiTrash2 size={16}/></button>
                    </div>
                  ))}
                </div>
                {visibleExperiences.length === 0 && <div className="glass p-8 text-center text-gray-500">No experiences yet</div>}
              </>
            )}

          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {uploadProgress !== null && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="max-w-6xl mx-auto mt-6 overflow-hidden"
          >
            <div className="glass p-3 border-cyan-400/30">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-[10px] text-cyan-400 mono uppercase tracking-widest font-bold flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                  </span>
                  Sending data to server
                </span>
                <span className="text-xs text-white mono font-bold">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-white/5 rounded-full h-1 overflow-hidden border border-white/5">
                <motion.div
                  className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 shadow-[0_0_10px_rgba(34,211,238,0.5)]"
                  initial={{ width: 0 }}
                  animate={{ width: `${uploadProgress}%` }}
                  transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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

        {selectedMsg && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedMsg(null)}>
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} className="glass max-w-2xl w-full p-8 relative" onClick={(e) => e.stopPropagation()}>
              <button onClick={() => setSelectedMsg(null)} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"><FiX size={20}/></button>
              
              <div className="mb-6">
                <div className="mono text-[10px] text-cyan-400 mb-1 uppercase tracking-widest">Message Detail</div>
                <h2 className="text-2xl font-bold text-white leading-tight">{selectedMsg.subject || 'No Subject'}</h2>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-6 border-b border-white/5">
                  <div>
                    <label className="block text-[10px] text-gray-500 mono mb-1 uppercase">From</label>
                    <div className="text-white font-medium">{selectedMsg.name}</div>
                  </div>
                  <div>
                    <label className="block text-[10px] text-gray-500 mono mb-1 uppercase">Email</label>
                    <a href={`mailto:${selectedMsg.email}`} className="text-cyan-400 hover:underline">{selectedMsg.email}</a>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] text-gray-500 mono mb-2 uppercase">Message Content</label>
                  <div className="bg-white/5 border border-white/10 rounded-xl p-5 text-gray-300 text-sm leading-relaxed whitespace-pre-wrap min-h-[150px] max-h-[400px] overflow-auto">
                    {selectedMsg.message}
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <div className="text-[10px] text-gray-500 mono">Received: {new Date(selectedMsg.created_at).toLocaleString()}</div>
                  <div className="flex gap-3">
                    <button 
                      onClick={() => {
                        deleteMessage(selectedMsg.id).then(() => {
                          refreshData();
                          setSelectedMsg(null);
                        });
                      }} 
                      className="px-4 py-2 rounded-lg text-sm text-red-400 hover:bg-red-400/10 border border-red-400/20 transition-all flex items-center gap-2"
                    >
                      <FiTrash2 size={14}/> Delete
                    </button>
                    <a 
                      href={`mailto:${selectedMsg.email}?subject=${encodeURIComponent(`Re: ${selectedMsg.subject || 'Your message'}`)}`}
                      className="btn-gradient px-6 py-2 rounded-lg text-sm font-semibold flex items-center gap-2"
                    >
                      <FiMail size={14}/> Reply
                    </a>
                  </div>
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

function BlogCard({ blog: b, onUpdate, onDelete, onUpload, setBlogs, getSafeUrl, compact = false, full = false, onClose }: {
  blog: any;
  onUpdate: (data: any) => Promise<any>;
  onDelete: () => void;
  onUpload: (file: File, type: 'image'|'video'|'document') => Promise<string | null>;
  setBlogs: React.Dispatch<React.SetStateAction<any[]>>;
  compact?: boolean;
  full?: boolean;
  onClose?: () => void;
  getSafeUrl: (url: string | null) => string;
}) {
  // const [title, setTitle] = useState(b.title); // Removed local state
  // const [content, setContent] = useState(b.content || ''); // Removed local state
  // useEffect(() => { setTitle(b.title); setContent(b.content || ''); }, [b.title, b.content]); // Removed local state effect
  const derivedSlug = b.slug || slugify(b.title);
  const wordCount = countWords(b.content);
  const readingTime = estimateReadingTime(b.content);

  const applyBlogPatch = (patch: Record<string, any>) => {
    setBlogs(prev => prev.map(x => x.id === b.id ? { ...x, ...patch } : x));
    return onUpdate(patch);
  };



  return (
    <div className={`glass p-5 border-l-4 border-l-purple-500 ${compact ? 'cursor-pointer hover:border-l-purple-400' : ''}`}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-2">
        <input
          className="bg-transparent text-lg font-bold text-white outline-none w-full sm:w-1/2"
          value={b.title}
          onChange={(e) => setBlogs(prev => prev.map(x => x.id === b.id ? { ...x, title: e.target.value } : x))}
          onBlur={(e) => onUpdate({ title: e.target.value })}
          readOnly={compact}
        />
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          {compact && <span className={`text-[10px] px-2.5 py-1 rounded-full border ${b.status === 'published' ? 'text-green-300 border-green-400/20 bg-green-400/10' : 'text-yellow-200 border-yellow-400/20 bg-yellow-400/10'}`}>{b.coming_soon ? 'Coming Soon' : b.status}</span>}
          {compact && (
            <button
              onClick={async (e) => {
                e.stopPropagation();
                if (b.status === 'published') {
                  await onUpdate({ status: 'draft', coming_soon: false });
                  toast.success('Unposted');
                } else {
                  if (!b.title?.trim() || !b.content?.trim()) {
                    toast.error('Title and content are required to post.');
                    return;
                  }
                  await onUpdate({ status: 'published', coming_soon: false });
                  toast.success('Posted');
                }
              }}
              className={`text-xs px-3 py-1.5 rounded font-semibold ${b.status === 'published' ? 'bg-red-500/40 text-white' : 'bg-green-500/30 text-white hover:bg-green-500/45'}`}
            >
              {b.status === 'published' ? 'Unpost' : 'Post'}
            </button>
          )}
          {!compact && (
            <>
              <button
                onClick={async () => {
                  await applyBlogPatch({ status: 'draft', coming_soon: false });
                  toast.success('Draft saved');
                  onClose?.();
                }}
                className={`text-xs px-3 py-1.5 rounded font-semibold ${b.status === 'draft' ? 'bg-gray-500/40 text-white' : 'bg-gray-500/20 text-gray-200 hover:bg-gray-500/30 hover:text-white'}`}
              >
                Save Draft
              </button>
              <button
                onClick={async () => {
                  if (!b.title?.trim() || !b.content?.trim()) {
                    toast.error('Title and content are required to post.');
                    return;
                  }
                  await applyBlogPatch({ status: 'published', coming_soon: false });
                  toast.success('Blog posted');
                  onClose?.();
                }}
                className={`text-xs px-3 py-1.5 rounded font-semibold ${b.status === 'published' ? 'bg-green-500/40 text-white' : 'bg-green-500/25 text-white hover:bg-green-500/40'}`}
              >
                Post
              </button>
              <button onClick={onDelete} className="text-red-400 ml-2"><FiTrash2 size={16}/></button>
            </>
          )}
        </div>
      </div>
      {compact && (
        <div className="flex flex-wrap gap-2 text-[10px] text-gray-500 mono mb-3">
          <span className="rounded-full border border-white/10 px-2 py-1">/{derivedSlug || 'missing-slug'}</span>
          <span className="rounded-full border border-white/10 px-2 py-1">{wordCount} words</span>
          <span className="rounded-full border border-white/10 px-2 py-1">{readingTime} min read</span>
          <span className="rounded-full border border-white/10 px-2 py-1">{b.comments?.length || 0} comments</span>
        </div>
      )}
      {!compact && (
        <>
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-3 mb-3">
            <div className="xl:col-span-2">
              <label className="block text-[10px] text-gray-500 mono uppercase mb-1 tracking-widest">Excerpt</label>
              <textarea
                className="w-full bg-white/5 rounded p-3 text-sm text-gray-300 h-24 focus:border-cyan-400/50 border border-white/10 outline-none"
                value={b.excerpt ?? ''}
                onChange={(e) => setBlogs(prev => prev.map(x => x.id === b.id ? { ...x, excerpt: e.target.value } : x))}
                onBlur={(e) => onUpdate({ excerpt: e.target.value })}
                placeholder="Short excerpt..."
              />
            </div>
            <div>
              <label className="block text-[10px] text-gray-500 mono uppercase mb-1 tracking-widest">Slug</label>
              <div className="flex gap-2">
                <input
                  className="w-full bg-white/5 rounded p-3 text-sm text-gray-300 border border-white/10 outline-none focus:border-cyan-400/50"
                  value={derivedSlug}
                  onChange={(e) => setBlogs(prev => prev.map(x => x.id === b.id ? { ...x, slug: slugify(e.target.value) } : x))}
                  onBlur={(e) => onUpdate({ slug: slugify(e.target.value) })}
                />
                <button onClick={() => copyText(getBlogPublicUrl(derivedSlug), 'Public URL')} className="px-3 rounded-lg border border-white/10 text-gray-300 hover:text-white"><FiCopy size={14} /></button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                <div className="text-[10px] text-gray-500 mono uppercase tracking-widest">Words</div>
                <div className="text-lg font-bold text-white">{wordCount}</div>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                <div className="text-[10px] text-gray-500 mono uppercase tracking-widest">Read Time</div>
                <div className="text-lg font-bold text-white">{readingTime}m</div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-3">
            <button onClick={() => applyBlogPatch({ status: b.status === 'published' ? 'draft' : 'published', coming_soon: false })} className="px-3 py-2 rounded-lg text-xs border border-white/10 text-gray-200 hover:text-white">
              {b.status === 'published' ? 'Move To Draft' : 'Mark Published'}
            </button>
            <button onClick={() => applyBlogPatch({ coming_soon: !b.coming_soon, status: b.coming_soon ? b.status : 'draft' })} className={`px-3 py-2 rounded-lg text-xs border ${b.coming_soon ? 'border-yellow-400/20 text-yellow-300 bg-yellow-400/10' : 'border-white/10 text-gray-300'}`}>
              {b.coming_soon ? 'Disable Coming Soon' : 'Enable Coming Soon'}
            </button>
            <button onClick={() => window.open(getBlogPublicUrl(derivedSlug), '_blank')} className="px-3 py-2 rounded-lg text-xs border border-white/10 text-gray-300 hover:text-white inline-flex items-center gap-1">
              <FiExternalLink size={12} /> Open Post
            </button>
          </div>
        </>
      )}
      <div className="flex justify-between items-end mb-2">
        <textarea
          className={`flex-1 bg-white/5 rounded p-3 text-sm text-gray-300 ${compact ? 'h-24' : full ? 'min-h-[70vh]' : 'min-h-[420px]'} focus:border-cyan-400/50 border border-white/10 outline-none`}
          value={b.content}
          onChange={(e) => setBlogs(prev => prev.map(x => x.id === b.id ? { ...x, content: e.target.value } : x))}
          onBlur={(e) => onUpdate({ content: e.target.value })}
          placeholder="Markdown content..."
          readOnly={compact}
        />
        {/* Auto format removed */}
      </div>
      {!compact && (
        <div className="flex flex-col gap-3 mt-2">
          <div className="rounded-xl border border-white/10 bg-white/5 p-3 flex flex-wrap gap-3 text-xs text-gray-300">
            <span className="inline-flex items-center gap-1"><FiHash size={12} /> Slug: <span className="text-white">{derivedSlug || 'pending'}</span></span>
            <span className="inline-flex items-center gap-1"><FiClock size={12} /> {readingTime} min read</span>
            <span className="inline-flex items-center gap-1"><FiLink size={12} /> {b.cover_image ? 'Cover ready' : 'No cover image'}</span>
          </div>
          <div className="flex gap-4 items-center flex-wrap">
          {b.cover_image && <img src={getSafeUrl(b.cover_image)} className="h-10 rounded" alt="cover"/>}
          <label className="btn-gradient px-3 py-1.5 rounded text-xs cursor-pointer flex items-center gap-1"><FiImage/> Cover Image
            <input type="file" hidden accept="image/*" onChange={async (e) => { 
                const file = e.target.files?.[0];
                if (file) {
                    const url = await onUpload(file, 'image'); 
                    if (url) onUpdate({ cover_image: url }); 
                }
            }} />
          </label>
          <label className="border border-white/20 text-gray-300 hover:text-white px-3 py-1.5 rounded text-xs cursor-pointer flex items-center gap-1"><FiImage/> Insert Image
            <input type="file" hidden accept="image/*" onChange={async (e) => { 
              const file = e.target.files?.[0];
              if (file) {
                  const url = await onUpload(file, 'image'); 
                  if (url) {
                    const md = `\n![image](${getSafeUrl(url)})\n`;
                    setBlogs(prev => prev.map(x => x.id === b.id ? { ...x, content: x.content + md } : x));
                    onUpdate({ content: b.content + md });
                  }
              }
            }} />
          </label>
          {b.cover_image && (
            <button onClick={() => applyBlogPatch({ cover_image: null })} className="px-3 py-1.5 rounded text-xs border border-white/10 text-gray-300 hover:text-white">
              Remove Cover
            </button>
          )}
          </div>
        </div>
      )}
    </div>
  );
}

function TechStackInput({ 
  techs = [], 
  onChange, 
  onBlur 
}: { 
  techs: string[]; 
  onChange: (newTechs: string[]) => void;
  onBlur: (newTechs: string[]) => void;
}) {
  const [inputValue, setInputValue] = useState('');

  const addTag = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const items = trimmed.split(',').map(s => s.trim()).filter(Boolean);
    const updated = Array.from(new Set([...techs, ...items]));
    onChange(updated);
    onBlur(updated);
    setInputValue('');
  };

  const removeTag = (indexToRemove: number) => {
    const updated = techs.filter((_, idx) => idx !== indexToRemove);
    onChange(updated);
    onBlur(updated);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(inputValue);
    }
  };

  return (
    <div className="space-y-2 mt-2">
      <label className="block text-[10px] text-gray-500 mono uppercase tracking-widest">
        Technologies & Tools
      </label>
      <div className="flex flex-wrap items-center gap-2 bg-white/5 border border-white/10 rounded-xl p-3 focus-within:border-cyan-400/50">
        {techs.map((tech, idx) => (
          <span 
            key={idx} 
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-cyan-400/10 text-cyan-300 border border-cyan-400/20"
          >
            {tech}
            <button 
              type="button" 
              onClick={() => removeTag(idx)} 
              className="text-cyan-400 hover:text-red-400 transition-colors"
            >
              <FiX size={12} />
            </button>
          </span>
        ))}
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => {
            if (inputValue.trim()) {
              addTag(inputValue);
            }
          }}
          placeholder="e.g. React, Docker, Python — press Enter to add"
          className="flex-1 bg-transparent text-sm text-gray-200 outline-none min-w-[220px]"
        />
      </div>
    </div>
  );
}

function ProjectCard({ project: p, onUpdate, onDelete, onUpload, setProjects, getSafeUrl }: {
  project: any;
  onUpdate: (data: any) => Promise<any>;
  onDelete: () => void;
  onUpload: (file: File, type: 'image'|'video'|'document') => Promise<string | null>;
  setProjects: React.Dispatch<React.SetStateAction<any[]>>;
  getSafeUrl: (url: string | null) => string;
}) {
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
        <div>
          <label className="block text-[10px] text-gray-500 mono uppercase mb-1 tracking-widest">Category</label>
          <input
            className="w-full bg-white/5 border border-white/10 rounded-lg text-sm text-gray-300 p-2.5 outline-none focus:border-cyan-400/30"
            value={p.category ?? ''}
            onChange={(e) => setProjects(prev => prev.map(x => x.id === p.id ? { ...x, category: e.target.value } : x))}
            onBlur={(e) => onUpdate({ category: e.target.value })}
            placeholder="Web app, Mobile, AI..."
          />
        </div>
        <div>
          <label className="block text-[10px] text-gray-500 mono uppercase mb-1 tracking-widest">Display Order</label>
          <input
            type="number"
            className="w-full bg-white/5 border border-white/10 rounded-lg text-sm text-gray-300 p-2.5 outline-none focus:border-cyan-400/30"
            value={p.order ?? 0}
            onChange={(e) => setProjects(prev => prev.map(x => x.id === p.id ? { ...x, order: Number(e.target.value) } : x))}
            onBlur={(e) => onUpdate({ order: Number(e.target.value) })}
          />
        </div>
        <div>
          <label className="block text-[10px] text-gray-500 mono uppercase mb-1 tracking-widest">Live URL</label>
          <input
            className="w-full bg-white/5 border border-white/10 rounded-lg text-sm text-gray-300 p-2.5 outline-none focus:border-cyan-400/30"
            value={p.live_url ?? ''}
            onChange={(e) => setProjects(prev => prev.map(x => x.id === p.id ? { ...x, live_url: e.target.value } : x))}
            onBlur={(e) => onUpdate({ live_url: e.target.value })}
            placeholder="https://..."
          />
        </div>
        <div>
          <label className="block text-[10px] text-gray-500 mono uppercase mb-1 tracking-widest">GitHub URL</label>
          <input
            className="w-full bg-white/5 border border-white/10 rounded-lg text-sm text-gray-300 p-2.5 outline-none focus:border-cyan-400/30"
            value={p.github_url ?? ''}
            onChange={(e) => setProjects(prev => prev.map(x => x.id === p.id ? { ...x, github_url: e.target.value } : x))}
            onBlur={(e) => onUpdate({ github_url: e.target.value })}
            placeholder="https://github.com/..."
          />
        </div>
      </div>
      <div className="flex justify-between items-end mb-2 border-b border-white/5 pb-2 mt-2">
        <textarea
          className="flex-1 bg-transparent text-gray-400 text-sm h-16 outline-none resize-none"
          value={p.description ?? ''}
          onChange={(e) => setProjects(prev => prev.map(x => x.id === p.id ? { ...x, description: e.target.value } : x))}
          onBlur={(e) => onUpdate({ description: e.target.value })}
          placeholder="Project Description..."
        />
      </div>

      <TechStackInput 
        techs={p.tech_stack || []} 
        onChange={(newTechs) => setProjects(prev => prev.map(x => x.id === p.id ? { ...x, tech_stack: newTechs } : x))}
        onBlur={(newTechs) => onUpdate({ tech_stack: newTechs })}
      />
      
      <div className="flex flex-col gap-3 mt-3 pt-3 border-t border-white/5">
        {/* Main Cover & Video */}
        <div className="flex flex-wrap gap-4 items-center">
          {p.image_url && <img src={getSafeUrl(p.image_url)} className="h-8 rounded" alt="img"/>}
          <label className="text-xs text-blue-400 cursor-pointer flex items-center gap-1"><FiImage/> Main Image
            <input type="file" hidden accept="image/*" onChange={async (e) => { 
                const file = e.target.files?.[0];
                if (file) {
                    const url = await onUpload(file, 'image'); 
                    if (url) onUpdate({ image_url: url }); 
                }
            }} />
          </label>
          {p.image_url && (
            <button onClick={() => onUpdate({ image_url: null })} className="text-xs text-gray-400 hover:text-white">Remove Image</button>
          )}
          {p.video_url && <div className="text-xs text-green-400 flex items-center gap-1"><FiVideo/> Video attached</div>}
          <label className="text-xs text-purple-400 cursor-pointer flex items-center gap-1"><FiVideo/> Main Video
            <input type="file" hidden accept="video/*" onChange={async (e) => { 
                const file = e.target.files?.[0];
                if (file) {
                    const url = await onUpload(file, 'video'); 
                    if (url) onUpdate({ video_url: url }); 
                }
            }} />
          </label>
          {p.video_url && (
            <button onClick={() => onUpdate({ video_url: null })} className="text-xs text-gray-400 hover:text-white">Remove Video</button>
          )}
        </div>
        
        {/* Gallery Images */}
        <div className="pt-2 border-t border-white/5 flex flex-wrap items-center gap-2">
          <span className="text-xs text-gray-400 mono mr-2">Gallery:</span>
          {p.gallery?.map((img: string, idx: number) => (
             <div key={idx} className="relative group">
               <img src={getSafeUrl(img)} className="h-10 w-10 object-cover rounded border border-white/10" alt="gallery"/>
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
                const url = await onUpload(e.target.files[i], 'image');
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








