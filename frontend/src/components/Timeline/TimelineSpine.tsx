interface TimelineSpineProps {
  scrollProgress: number;
}

export default function TimelineSpine({ scrollProgress }: TimelineSpineProps) {
  return (
    <div className="absolute top-[100vh] bottom-[50vh] right-[60px] md:right-[10%] lg:right-[15%] w-0.5 pointer-events-none hidden md:block">
      {/* Background track line */}
      <div 
        className="w-full h-full bg-orange-200/20"
        style={{
          borderLeft: '1px dashed rgba(230, 215, 195, 0.4)'
        }}
      />
      {/* Scroll-driven active filled line */}
      <div 
        className="absolute top-0 w-0.5 rounded-full"
        style={{
          height: `${scrollProgress * 100}%`,
          background: 'linear-gradient(180deg, var(--accent-secondary) 0%, var(--accent-primary) 50%, var(--text-muted) 100%)',
          boxShadow: '0 0 8px rgba(232, 116, 29, 0.5)',
          transition: 'height 0.1s ease-out'
        }}
      />
    </div>
  );
}
