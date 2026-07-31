import { NavLink } from 'react-router-dom';
import { FiArrowRight, FiExternalLink } from 'react-icons/fi';
import MilestoneDate from './MilestoneDate';
import MarkdownRenderer from "../../components/MarkdownRenderer";

interface MilestoneContentProps {
  year: string;
  title: string;
  subtitle?: string;
  description: string;
  skills: string[];
  cta?: {
    label: string;
    url: string;
    isExternal: boolean;
  };
}

export default function MilestoneContent({
  year,
  title,
  subtitle,
  description,
  skills,
  cta,
}: MilestoneContentProps) {
  return (
    <div className="space-y-4 flex-1">
      {/* Date badge */}
      <MilestoneDate year={year} />

      {/* Title & Subtitle */}
      <div className="space-y-1">
        <h3 
          className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight"
          style={{ 
            fontFamily: 'var(--font-display)', 
            color: 'var(--accent-primary)',
            letterSpacing: '-0.02em'
          }}
        >
          {title}
        </h3>
        {subtitle && (
          <p className="text-sm font-medium opacity-80" style={{ color: 'var(--text-secondary)' }}>
            {subtitle}
          </p>
        )}
      </div>

      {/* Narrative Description */}
      <MarkdownRenderer content={description} />

      {/* Tech Tags */}
      {skills && skills.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-2">
          {skills.map((skill) => (
            <span key={skill} className="tech-tag">
              {skill}
            </span>
          ))}
        </div>
      )}

      {/* CTA Button */}
      {cta && (
        <div className="pt-2">
          {cta.isExternal ? (
            <a
              href={cta.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-widest hover:underline transition-all"
              style={{ color: 'var(--accent-primary)' }}
            >
              <span>{cta.label}</span>
              <FiExternalLink size={12} />
            </a>
          ) : (
            <NavLink
              to={cta.url}
              className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-widest hover:underline transition-all"
              style={{ color: 'var(--accent-primary)' }}
            >
              <span>{cta.label}</span>
              <FiArrowRight size={12} />
            </NavLink>
          )}
        </div>
      )}
    </div>
  );
}
