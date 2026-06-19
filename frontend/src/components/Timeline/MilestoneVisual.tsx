import { getSafeUrl } from '../../api';

interface MilestoneVisualProps {
  image?: string | null;
  video?: string | null;
  title: string;
}

export default function MilestoneVisual({ image, video, title }: MilestoneVisualProps) {
  if (!image && !video) return null;

  return (
    <div className="w-full lg:w-[45%] flex-shrink-0 relative group">
      {/* Decorative background border glow */}
      <div 
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(232, 116, 29, 0.15) 0%, transparent 70%)',
          margin: '-10px'
        }}
      />
      
      <div 
        className="w-full overflow-hidden rounded-2xl border transition-all duration-500 group-hover:scale-[1.01]"
        style={{
          borderColor: 'rgba(232, 116, 29, 0.15)',
          boxShadow: '0 8px 30px rgba(26, 20, 16, 0.08)'
        }}
      >
        {video ? (
          <video
            src={getSafeUrl(video)}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-auto max-h-[300px] object-cover"
          />
        ) : (
          image && (
            <img
              src={getSafeUrl(image)}
              alt={title}
              loading="lazy"
              className="w-full h-auto max-h-[320px] object-cover"
              onError={(e) => {
                // If PDF or broken link, we can render a structured backup/placeholder
                e.currentTarget.style.display = 'none';
              }}
            />
          )
        )}
      </div>
    </div>
  );
}
