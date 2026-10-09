import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowLeft, FiBookOpen, FiBriefcase, FiCheck, FiCode, FiExternalLink, FiGrid, FiLogOut, FiMail, FiMessageSquare, FiPlus, FiSettings, FiTrash2 } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/useAuth';
import { useSettings } from '../../context/useSettings';
import * as api from '../../api';
import { errorMessage } from '../../api/errors';
import type { Blog, Project, Experience, Message, Comment, DerivedSkill } from '../../api/types';
import MarkdownRenderer from '../../components/MarkdownRenderer';
import '../../styles/admin.css';

const tabs = [
  { id: 'settings', label: 'Site settings', icon: FiSettings, description: 'Update the content visitors see on your homepage.' },
  { id: 'blogs', label: 'Blog posts', icon: FiBookOpen, description: 'Write, preview, and publish your articles.' },
  { id: 'projects', label: 'Projects', icon: FiCode, description: 'Manage your work and the technologies behind it.' },
  { id: 'experience', label: 'Education & certificates', icon: FiBriefcase, description: 'Keep your education and qualifications up to date.' },
  { id: 'skills', label: 'Skills', icon: FiGrid, description: 'Skills shown on your portfolio come from your project technology stacks.' },
  { id: 'messages', label: 'Messages', icon: FiMail, description: 'Read and reply to messages from your contact form.' },
  { id: 'comments', label: 'Comments', icon: FiMessageSquare, description: 'Review comments before they appear on your blog.' },
] as const;
type Tab = typeof tabs[number]['id'];
type Resource = 'blogs' | 'projects' | 'experience';
type Entry = Blog | Project | Experience;
type Field = { key: string; label: string; type?: 'text' | 'textarea' | 'url' | 'number' | 'date' | 'checkbox' | 'image' | 'video' | 'document' | 'list'; required?: boolean; hint?: string };
type Draft = Record<string, string | boolean>;
const fields: Record<Resource, Field[]> = {
  blogs: [
    { key: 'title', label: 'Title', required: true },
    { key: 'excerpt', label: 'Short summary', type: 'textarea' },
    { key: 'cover_image', label: 'Cover image', type: 'image' },
    { key: 'content', label: 'Article', type: 'textarea', required: true, hint: 'Markdown supported: ## heading, **bold**, [link](https://example.com).' },
  ],
  projects: [
    { key: 'title', label: 'Project title', required: true },
    { key: 'category', label: 'Category', required: true },
    { key: 'description', label: 'Description', type: 'textarea' },
    { key: 'tech_stack', label: 'Technologies', type: 'list', hint: 'Separate with commas. These also appear in the Skills section.' },
    { key: 'image_url', label: 'Cover image', type: 'image' },
    { key: 'video_url', label: 'Video', type: 'video' },
    { key: 'gallery', label: 'Gallery image URLs', type: 'list', hint: 'One URL per line or separated by commas.' },
    { key: 'github_url', label: 'Source code URL', type: 'url' },
    { key: 'live_url', label: 'Live project URL', type: 'url' },
    { key: 'order', label: 'Display order', type: 'number', hint: 'Lower numbers appear first.' },
    { key: 'featured', label: 'Featured project', type: 'checkbox' },
    { key: 'coming_soon', label: 'Coming soon', type: 'checkbox' },
  ],
  experience: [
    { key: 'company', label: 'Institution / organization', required: true },
    { key: 'role', label: 'Qualification / role', required: true },
    { key: 'description', label: 'Description', type: 'textarea' },
    { key: 'location', label: 'Location' },
    { key: 'start_date', label: 'Start date', type: 'date', required: true },
    { key: 'end_date', label: 'End date', type: 'date' },
    { key: 'current', label: 'Currently studying / working here', type: 'checkbox' },
    { key: 'certificate_url', label: 'Certificate file', type: 'document' },
    { key: 'credential_link', label: 'Credential verification URL', type: 'url' },
    { key: 'tech_stack', label: 'Related technologies', type: 'list' },
    { key: 'order', label: 'Display order', type: 'number' },
  ],
};
const settingsFields: Field[] = [
  { key: 'home_name', label: 'Full name', required: true },
  { key: 'about_bio', label: 'About me', type: 'textarea', hint: 'Separate paragraphs with a blank line. Markdown supported.' },
  { key: 'social_email', label: 'Contact email' },
  { key: 'social_github', label: 'GitHub URL', type: 'url' },
  { key: 'social_linkedin', label: 'LinkedIn URL', type: 'url' },
];
const entryTitle = (entry: Entry) => 'title' in entry ? entry.title : entry.role;
const loaders = { blogs: api.getAdminBlogs, projects: api.getProjects, experience: api.getExperiences };
const creators = { blogs: api.createBlog, projects: api.createProject, experience: api.createExperience };
const updaters = { blogs: api.updateBlog, projects: api.updateProject, experience: api.updateExperience };
const removers = { blogs: api.deleteBlog, projects: api.deleteProject, experience: api.deleteExperience };

function useLoad<T>(loader: () => Promise<{ data: T }>) {
  const [state, setState] = useState<{ data?: T; error?: string }>({});
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    let active = true;
    loader().then(({ data }) => { if (active) setState({ data }); })
      .catch(error => { if (active) setState({ error: errorMessage(error, 'Could not load this section.') }); });
    return () => { active = false; };
  }, [loader, revision]);
  return { ...state, reload: () => setRevision(value => value + 1) };
}
function LoadState({ error, retry }: { error?: string; retry: () => void }) {
  return <div className="admin-empty" role="status">{error ? <><p>{error}</p><button onClick={retry}>Try again</button></> : 'Loading…'}</div>;
}
function FieldInput({ field, value, onChange }: { field: Field; value: string | boolean; onChange: (value: string | boolean) => void }) {
  const id = `field-${field.key}`;
  if (field.type === 'checkbox') return <label className="admin-check"><input id={id} type="checkbox" checked={Boolean(value)} onChange={e => onChange(e.target.checked)} />{field.label}</label>;
  return <label className={`admin-field ${field.type === 'textarea' || field.type === 'list' ? 'admin-wide' : ''}`} htmlFor={id}>
    <span>{field.label}{field.required && ' *'}</span>
    {field.type === 'textarea' || field.type === 'list'
      ? <textarea id={id} rows={field.key === 'content' ? 18 : field.type === 'list' ? 2 : 5} value={String(value ?? '')} required={field.required} onChange={e => onChange(e.target.value)} />
      : <input id={id} type={field.key === 'social_email' ? 'email' : field.type || 'text'} value={String(value ?? '')} required={field.required} onChange={e => onChange(e.target.value)} />}
    {field.hint && <small>{field.hint}</small>}
  </label>;
}
function UploadField({ field, value, onChange, onBusy }: { field: Field; value: string; onChange: (url: string) => void; onBusy: (busy: boolean) => void }) {
  const [progress, setProgress] = useState<number | null>(null);
  const type = field.type as 'image' | 'video' | 'document';
  async function upload(file?: File) {
    if (!file) return;
    onBusy(true); setProgress(0);
    try { const { data } = await api.uploadFile(file, type, setProgress); onChange(data.url); toast.success('File uploaded. Save your changes to use it.'); }
    catch (error) { toast.error(errorMessage(error, 'Upload failed. Check the file type and size.')); }
    finally { onBusy(false); setProgress(null); }
  }
  return <div className="admin-field admin-wide"><span>{field.label}</span><div className="admin-upload">
    {value && type === 'image' && <img src={api.getSafeUrl(value)} alt={`${field.label} preview`} />}
    <div className="admin-upload-controls"><label className="admin-file-label">{progress === null ? `Upload ${type}` : `Uploading ${progress}%…`}<input aria-label={`Upload ${field.label}`} type="file" disabled={progress !== null} accept={type === 'image' ? 'image/jpeg,image/png,image/webp,image/gif' : type === 'video' ? 'video/mp4,video/webm,video/quicktime' : '.pdf,.doc,.docx,.txt,.zip'} onChange={e => { void upload(e.target.files?.[0]); e.target.value = ''; }} /></label>
      <input aria-label={`${field.label} URL`} placeholder="Or paste a file URL" value={value} onChange={e => onChange(e.target.value)} />
      {value && <div className="admin-actions"><a href={api.getSafeUrl(value)} target="_blank" rel="noreferrer">Open file <FiExternalLink /></a><button type="button" onClick={() => onChange('')}>Remove</button></div>}
      <small>{type === 'image' ? 'JPG, PNG, WebP or GIF · up to 15 MB' : type === 'video' ? 'MP4, WebM or MOV · up to 100 MB' : 'PDF, Word, text or ZIP · up to 20 MB'}</small>
    </div></div></div>;
}
function SettingsPanel({ onDirty }: { onDirty: (dirty: boolean) => void }) {
  const { data, error, reload } = useLoad<Record<string, string>>(api.getSettings);
  if (!data) return <LoadState error={error} retry={reload} />;
  return <SettingsForm initial={data} onDirty={onDirty} />;
}
function ImageAttachments({ label, onUpload, onBusy }: { label: string; onUpload: (urls: string[]) => void; onBusy: (busy: boolean) => void }) {
  async function upload(files: File[]) {
    if (!files.length) return;
    onBusy(true);
    const urls: string[] = [];
    try {
      for (const file of files) {
        const { data } = await api.uploadFile(file, 'image');
        urls.push(data.url);
      }
    } catch (error) { toast.error(errorMessage(error, 'Some images could not be uploaded.')); }
    finally { if (urls.length) onUpload(urls); onBusy(false); }
  }
  return <label className="admin-file-label">{label}<input aria-label={label} type="file" multiple accept="image/jpeg,image/png,image/webp,image/gif" onChange={event => { void upload(Array.from(event.target.files || [])); event.target.value = ''; }} /></label>;
}
function SettingsForm({ initial, onDirty }: { initial: Record<string, string>; onDirty: (dirty: boolean) => void }) {
  const [draft, setDraft] = useState(initial);
  const [saved, setSaved] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { refreshSettings } = useSettings();
  const dirty = JSON.stringify(draft) !== JSON.stringify(saved);
  useEffect(() => onDirty(dirty || uploading || saving), [dirty, uploading, saving, onDirty]);
  async function save(event: FormEvent) {
    event.preventDefault(); setSaving(true);
    try { await api.updateSettings(draft); setSaved(draft); await refreshSettings(); toast.success('Site settings saved'); }
    catch (error) { toast.error(errorMessage(error)); }
    finally { setSaving(false); }
  }
  return <form className="admin-card" onSubmit={save}><fieldset disabled={saving || uploading}><div className="admin-form-grid">
    <UploadField field={{ key: 'profile_photo', label: 'Profile photo', type: 'image' }} value={draft.profile_photo || ''} onChange={value => setDraft(prev => ({ ...prev, profile_photo: value }))} onBusy={setUploading} />
    {settingsFields.map(field => <FieldInput key={field.key} field={field} value={draft[field.key] || ''} onChange={value => setDraft(prev => ({ ...prev, [field.key]: String(value) }))} />)}
    </div></fieldset><div className="admin-savebar"><span>{uploading ? 'Uploading…' : dirty ? 'Unsaved changes' : 'All changes saved'}</span><button className="admin-primary" disabled={saving || uploading || !dirty}>{saving ? 'Saving…' : 'Save settings'}</button></div></form>;
}
function ResourcePanel({ resource, onDirty }: { resource: Resource; onDirty: (dirty: boolean) => void }) {
  const { data, error, reload } = useLoad<Entry[]>(loaders[resource]);
  const [editing, setEditing] = useState<Entry | 'new' | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  async function remove(id: number) {
    setBusy(true);
    try { await removers[resource](id); setDeleting(null); reload(); toast.success('Deleted'); }
    catch (error) { toast.error(errorMessage(error)); }
    finally { setBusy(false); }
  }
  if (editing) return <EntryEditor key={editing === 'new' ? 'new' : editing.id} resource={resource} entry={editing === 'new' ? undefined : editing} onDirty={onDirty} onClose={() => { setEditing(null); onDirty(false); }} onSaved={() => { setEditing(null); onDirty(false); reload(); }} />;
  const singular = resource === 'blogs' ? 'post' : resource === 'projects' ? 'project' : 'qualification';
  return <><div className="admin-toolbar"><span>{data ? `${data.length} ${resource === 'experience' ? 'qualifications' : resource}` : ''}</span><button className="admin-primary" onClick={() => setEditing('new')}><FiPlus /> New {singular}</button></div>
    {!data ? <LoadState error={error} retry={reload} /> : data.length === 0 ? <div className="admin-empty">No {resource === 'experience' ? 'qualifications' : resource} yet. Add your first {singular} above.</div> : <div className="admin-list">{data.map(entry => <article className="admin-row" key={entry.id}><div className="admin-row-body"><h3>{entryTitle(entry)}</h3><p>{'status' in entry ? (entry.coming_soon ? 'Coming soon' : entry.status === 'published' ? 'Published' : 'Draft') : 'company' in entry ? entry.company : entry.category}</p></div>
      {deleting === entry.id ? <div className="admin-actions"><span>Delete permanently?</span><button disabled={busy} className="admin-danger" onClick={() => remove(entry.id)}>Delete</button><button disabled={busy} onClick={() => setDeleting(null)}>Cancel</button></div> : <div className="admin-actions"><button onClick={() => setEditing(entry)}>Edit</button><button aria-label={`Delete ${entryTitle(entry)}`} onClick={() => setDeleting(entry.id)}><FiTrash2 /></button></div>}
    </article>)}</div>}</>;
}
function EntryEditor({ resource, entry, onDirty, onClose, onSaved }: { resource: Resource; entry?: Entry; onDirty: (dirty: boolean) => void; onClose: () => void; onSaved: () => void }) {
  const [draft, setDraft] = useState<Draft>(() => {
    const record = (entry || {}) as unknown as Record<string, unknown>;
    return Object.fromEntries([...fields[resource], { key: 'status' }, { key: 'coming_soon', type: 'checkbox' }].map(field => {
      const value = record[field.key];
      return [field.key, field.type === 'checkbox' ? Boolean(value) : Array.isArray(value) ? value.join(', ') : field.type === 'date' ? String(value || '').slice(0, 10) : String(value ?? (field.key === 'status' ? 'draft' : field.type === 'number' ? 0 : ''))];
    }));
  });
  const original = useRef(JSON.stringify(draft));
  const [preview, setPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const dirty = JSON.stringify(draft) !== original.current;
  useEffect(() => onDirty(dirty || uploading || saving), [dirty, uploading, saving, onDirty]);
  const patch = (key: string, value: string | boolean) => setDraft(prev => ({ ...prev, [key]: value }));
  const close = () => { if (!dirty || window.confirm('Discard your unsaved changes?')) onClose(); };
  async function save(event: FormEvent) {
    event.preventDefault();
    if (resource === 'blogs' && (!String(draft.title).trim() || !String(draft.content).trim())) { setPreview(false); toast.error('Add a title and article before saving.'); return; }
    setSaving(true);
    const payload: Record<string, unknown> = {};
    for (const field of fields[resource]) {
      const value = draft[field.key];
      payload[field.key] = field.type === 'list' ? String(value).split(/[,\n]/).map(item => item.trim()).filter(Boolean)
        : field.type === 'number' ? Number(value) : field.type === 'checkbox' ? Boolean(value)
        : value === '' && ['date', 'url', 'image', 'video', 'document'].includes(field.type || '') ? null : value;
    }
    if (resource === 'blogs') { payload.status = draft.status; payload.coming_soon = draft.coming_soon; }
    if (resource === 'experience' && draft.current) payload.end_date = null;
    try {
      if (entry) await updaters[resource](entry.id, payload); else await creators[resource](payload);
      toast.success('Changes saved'); onSaved();
    } catch (error) { toast.error(errorMessage(error, 'Could not save. Your changes are still here.')); }
    finally { setSaving(false); }
  }
  return <form className="admin-card" onSubmit={save}><div className="admin-editor-heading"><button type="button" disabled={saving || uploading} onClick={close}><FiArrowLeft /> Back to list</button><h2>{entry ? 'Edit' : 'New'} {resource === 'blogs' ? 'post' : resource === 'projects' ? 'project' : 'qualification'}</h2></div><fieldset disabled={saving || uploading}>
    {resource === 'blogs' && <div className="admin-toolbar"><div className="admin-actions"><button type="button" aria-pressed={!preview} onClick={() => setPreview(false)}>Write</button><button type="button" aria-pressed={preview} onClick={() => setPreview(true)}>Preview</button></div><label className="admin-status">Visibility<select aria-label="Post visibility" value={draft.coming_soon ? 'soon' : String(draft.status)} onChange={e => setDraft(prev => ({ ...prev, status: e.target.value === 'published' ? 'published' : 'draft', coming_soon: e.target.value === 'soon' }))}><option value="draft">Draft — only you</option><option value="soon">Coming soon — teaser only</option><option value="published">Published — everyone</option></select></label></div>}
    {preview && resource === 'blogs' ? <article className="admin-preview"><h1>{draft.title || 'Untitled post'}</h1>{draft.cover_image && <img src={api.getSafeUrl(String(draft.cover_image))} alt="Cover preview" />}<MarkdownRenderer content={String(draft.content || 'Your article preview will appear here.')} /></article> : <div className="admin-form-grid">
      {fields[resource].filter(field => field.key !== 'end_date' || !draft.current).map(field => ['image', 'video', 'document'].includes(field.type || '')
        ? <UploadField key={field.key} field={field} value={String(draft[field.key] || '')} onChange={value => patch(field.key, value)} onBusy={setUploading} />
        : <FieldInput key={field.key} field={field} value={draft[field.key]} onChange={value => patch(field.key, value)} />)}
    </div>}
    {!preview && resource === 'blogs' && <div className="admin-attachments"><ImageAttachments label="Insert images into article" onBusy={setUploading} onUpload={urls => setDraft(prev => ({ ...prev, content: String(prev.content) + '\n\n' + urls.map(url => `![Image](${url})`).join('\n\n') }))} /></div>}
    {resource === 'projects' && <div className="admin-attachments"><ImageAttachments label="Upload gallery images" onBusy={setUploading} onUpload={urls => setDraft(prev => ({ ...prev, gallery: [String(prev.gallery).trim(), ...urls].filter(Boolean).join(', ') }))} /></div>}
    </fieldset><div className="admin-savebar"><span>{uploading ? 'Uploading…' : dirty ? 'Unsaved changes' : 'No unsaved changes'}</span><div className="admin-actions"><button type="button" disabled={saving || uploading} onClick={close}>Cancel</button><button className="admin-primary" disabled={saving || uploading}>{saving ? 'Saving…' : 'Save changes'}</button></div></div></form>;
}
function Inbox({ comments = false }: { comments?: boolean }) {
  const loader: () => Promise<{ data: (Comment | Message)[] }> = comments ? api.getAllComments : api.getMessages;
  const { data, error, reload } = useLoad(loader);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  async function act(action: () => Promise<unknown>) {
    setBusy(true);
    try { await action(); setDeleting(null); reload(); }
    catch (error) { toast.error(errorMessage(error)); }
    finally { setBusy(false); }
  }
  if (!data) return <LoadState error={error} retry={reload} />;
  if (!data.length) return <div className="admin-empty">No {comments ? 'comments' : 'messages'} yet.</div>;
  return <div className="admin-list">{data.map(item => <article className="admin-card" key={item.id}>
    <div className="admin-row"><div className="admin-row-body"><h3>{'subject' in item ? item.subject || 'Message' : item.blog?.title || 'Blog comment'}</h3><p>{item.name} · {new Date(item.created_at).toLocaleDateString()}</p></div><span className="admin-badge">{'approved' in item ? item.approved ? 'Approved' : 'Pending review' : item.read ? 'Read' : 'Unread'}</span></div>
    {comments || expanded === item.id ? <><p className="admin-message">{'body' in item ? item.body : item.message}</p><p className="admin-muted">{item.email}</p></> : <p className="admin-message admin-excerpt">{'message' in item ? item.message : ''}</p>}
    <div className="admin-actions">
      {!comments && <button disabled={busy} onClick={() => { setExpanded(expanded === item.id ? null : item.id); if ('read' in item && !item.read) void act(() => api.markRead(item.id)); }}>{expanded === item.id ? 'Collapse' : 'Read message'}</button>}
      {item.email && <a href={`mailto:${item.email}${'subject' in item ? `?subject=${encodeURIComponent(`Re: ${item.subject || 'Your message'}`)}` : ''}`}>Reply by email <FiExternalLink /></a>}
      {'approved' in item && !item.approved && <button disabled={busy} onClick={() => act(() => api.approveComment(item.id))}><FiCheck /> Approve</button>}
      {deleting === item.id ? <><span>Delete permanently?</span><button className="admin-danger" disabled={busy} onClick={() => act(() => comments ? api.deleteComment(item.id) : api.deleteMessage(item.id))}>Delete</button><button disabled={busy} onClick={() => setDeleting(null)}>Cancel</button></> : <button disabled={busy} onClick={() => setDeleting(item.id)}><FiTrash2 /> Delete</button>}
    </div></article>)}</div>;
}
function SkillsPanel({ openProjects }: { openProjects: () => void }) {
  const { data, error, reload } = useLoad<DerivedSkill[]>(api.getDerivedSkills);
  if (!data) return <LoadState error={error} retry={reload} />;
  return <div className="admin-card"><p className="admin-muted">To add or remove a skill, edit the Technologies field of a project. This list matches the public Skills section.</p><button onClick={openProjects}>Manage project technologies <FiExternalLink /></button><div className="admin-skill-list">{data.length ? data.map(skill => <div key={skill.name}><strong>{skill.name}</strong><span>{skill.used_in.map(project => project.title).join(', ')}</span></div>) : <p>No project technologies yet.</p>}</div></div>;
}
export default function AdminDashboard() {
  const [tab, setTab] = useState<Tab>('settings');
  const [dirty, setDirty] = useState(false);
  const { logoutFn } = useAuth();
  const active = tabs.find(item => item.id === tab)!;
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ''; };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);
  function switchTab(next: Tab) {
    if (next === tab) return;
    if (dirty && !window.confirm('Discard your unsaved changes?')) return;
    setDirty(false); setTab(next);
  }
  return <div className="admin-shell" data-lenis-prevent><header className="admin-topbar"><Link to="/" target="_blank" className="admin-brand">Portfolio <span>Studio</span></Link><div className="admin-actions"><a href="/" target="_blank" rel="noreferrer">View site <FiExternalLink /></a><button onClick={() => { if (!dirty || window.confirm('Discard changes and sign out?')) void logoutFn(); }}><FiLogOut /> Sign out</button></div></header>
    <div className="admin-layout"><nav className="admin-nav" aria-label="Admin sections"><p>Workspace</p>{tabs.map(({ id, label, icon: Icon }) => <button key={id} aria-current={id === tab ? 'page' : undefined} onClick={() => switchTab(id)}><Icon />{label}</button>)}</nav>
      <main className="admin-content"><header className="admin-page-heading"><span className="admin-eyebrow">YOUR PORTFOLIO</span><h1>{active.label}</h1><p>{active.description}</p></header><section key={tab} aria-label={active.label}>
        {tab === 'settings' ? <SettingsPanel onDirty={setDirty} /> : tab === 'blogs' || tab === 'projects' || tab === 'experience' ? <ResourcePanel resource={tab} onDirty={setDirty} /> : tab === 'skills' ? <SkillsPanel openProjects={() => switchTab('projects')} /> : <Inbox comments={tab === 'comments'} />}
      </section></main></div></div>;
}
