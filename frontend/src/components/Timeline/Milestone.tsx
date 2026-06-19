import { motion } from 'framer-motion';
import MilestoneContent from './MilestoneContent';
import MilestoneVisual from './MilestoneVisual';
import TimelineNode from './TimelineNode';

interface MilestoneProps {
  id: string;
  year: string;
  title: string;
  subtitle?: string;
  description: string;
  image?: string | null;
  video?: string | null;
  skills: string[];
  featured: boolean;
  type: string;
  visual_layout: 'left-text' | 'right-text' | 'auto';
  cta?: {
    label: string;
    url: string;
    isExternal: boolean;
  };
  isActive: boolean;
  onActive: (id: string) => void;
}

export default function Milestone({
  id,
  year,
  title,
  subtitle,
  description,
  image,
  video,
  skills,
  featured,
  type,
  visual_layout,
  cta,
  isActive,
  onActive,
}: MilestoneProps) {
  const isLeftText = visual_layout === 'left-text';

  // Animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as const }
    }
  };

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-20% 0px -20% 0px' }}
      variants={cardVariants}
      onViewportEnter={() => onActive(id)}
      className="relative flex flex-col md:flex-row items-center w-full min-h-[40vh] py-16 gap-8 md:gap-12 scroll-mt-24"
    >
      {/* Node Dot aligned with Spine */}
      <TimelineNode featured={featured} type={type} isActive={isActive} year={year} />

      {/* Asymmetric layout box */}
      <div 
        className={`w-full flex flex-col lg:flex-row items-center gap-8 lg:gap-16 pr-0 md:pr-[120px] lg:pr-[25%] ${
          isLeftText ? 'lg:flex-row' : 'lg:flex-row-reverse'
        }`}
      >
        {/* Text Area */}
        <div className="flex-1 w-full milestone-card p-8 sm:p-10 border relative overflow-hidden">
          {/* Subtle warm glow overlay for featured cards */}
          {featured && (
            <div 
              className="absolute -right-20 -top-20 w-40 h-40 rounded-full blur-3xl opacity-20 pointer-events-none"
              style={{ background: 'var(--accent-primary)' }}
            />
          )}
          
          <MilestoneContent
            year={year}
            title={title}
            subtitle={subtitle}
            description={description}
            skills={skills}
            cta={cta}
          />
        </div>

        {/* Visual Area */}
        <MilestoneVisual image={image} video={video} title={title} />
      </div>
    </motion.div>
  );
}
