import { FiDownload } from 'react-icons/fi';
import { useSettings } from '../context/useSettings';

export default function ResumeLink({ compact = false }: { compact?: boolean }) {
  const { settings } = useSettings();
  const url = (settings.resume_url ?? '/cv/thimira-pathum.pdf').trim();
  if (!url || !/^(https?:\/\/|\/(?!\/))/i.test(url)) return null;
  return (
    <a href={url} download target="_blank" rel="noreferrer"
      className={`resume-link inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border-[1.5px] border-stone-500 px-5 text-sm font-semibold ${compact ? 'py-2' : 'min-h-12 py-3'}`}>
      <FiDownload size={18} aria-hidden="true" />{compact ? 'Resume' : 'Download CV'}
    </a>
  );
}
