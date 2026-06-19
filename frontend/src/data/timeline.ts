import { getProjects, getExperiences } from '../api';

export interface Milestone {
  id: string;
  year: string;
  title: string;
  subtitle?: string;
  description: string;
  image?: string | null;
  video?: string | null;
  skills: string[];
  featured: boolean;
  coming_soon: boolean;
  type: 'project' | 'education' | 'experience' | 'skills-reveal' | 'skills-mastery' | 'contact';
  timeline_order: number;
  visual_layout: 'left-text' | 'right-text' | 'auto';
  cta?: {
    label: string;
    url: string;
    isExternal: boolean;
  };
}

export async function fetchTimelineMilestones(): Promise<Milestone[]> {
  try {
    const [projectsRes, experiencesRes] = await Promise.all([
      getProjects(),
      getExperiences(),
    ]);

    const projects = projectsRes.data || [];
    const experiences = experiencesRes.data || [];

    // Map projects
    const projectMilestones: Milestone[] = projects.map((p: any) => {
      const displayYear = p.milestone_year || (p.coming_soon ? '2025' : '2024');
      const order = typeof p.timeline_order === 'number' ? p.timeline_order : (p.order ?? 99);
      
      let cta = undefined;
      if (p.live_url) {
        cta = { label: 'Visit Site', url: p.live_url, isExternal: true };
      } else if (p.github_url) {
        cta = { label: 'View GitHub', url: p.github_url, isExternal: true };
      } else {
        cta = { label: 'View Project Details', url: `/project/${p.id}`, isExternal: false };
      }

      return {
        id: `proj-${p.id}`,
        year: displayYear,
        title: p.title,
        subtitle: p.category || 'Project',
        description: p.description,
        image: p.image_url || (p.gallery && p.gallery.length > 0 ? p.gallery[0] : null),
        video: p.video_url,
        skills: p.tech_stack || [],
        featured: Boolean(p.featured),
        coming_soon: Boolean(p.coming_soon),
        type: 'project',
        timeline_order: order,
        visual_layout: p.visual_layout || 'auto',
        cta,
      };
    });

    // Map experiences
    const experienceMilestones: Milestone[] = experiences.map((e: any) => {
      const defaultYear = e.start_date ? new Date(e.start_date).getFullYear().toString() : '2024';
      const displayYear = e.milestone_year || (e.current ? `${defaultYear}-Present` : defaultYear);
      const order = typeof e.timeline_order === 'number' ? e.timeline_order : (e.order ?? 99);

      // Simple heuristic for education vs experience
      const isEducation = e.role.toLowerCase().includes('student') || 
                          e.role.toLowerCase().includes('degree') || 
                          e.company.toLowerCase().includes('academy') ||
                          e.company.toLowerCase().includes('university');

      return {
        id: `exp-${e.id}`,
        year: displayYear,
        title: e.role,
        subtitle: e.company,
        description: e.description,
        image: e.certificate_url,
        video: null,
        skills: e.tech_stack || [],
        featured: Boolean(e.featured),
        coming_soon: Boolean(e.current),
        type: isEducation ? 'education' : 'experience',
        timeline_order: order,
        visual_layout: e.visual_layout || 'auto',
        cta: e.certificate_url ? { label: 'View Credentials', url: e.certificate_url, isExternal: true } : undefined,
      };
    });

    // Merge and sort milestones by timeline_order
    let combined = [...projectMilestones, ...experienceMilestones];
    combined.sort((a, b) => a.timeline_order - b.timeline_order);

    // Apply layout alternation for "auto" alignments
    let textOnLeft = true;
    combined = combined.map((m) => {
      if (m.visual_layout === 'auto') {
        const layout = textOnLeft ? 'left-text' : 'right-text';
        textOnLeft = !textOnLeft; // alternate
        return { ...m, visual_layout: layout };
      }
      return m;
    });

    // Inject Interstitial Skills Reveal after index 1 (AWS Academy / Open Learning Lab)
    // If combined has elements, we place it in a structured spot
    const result: Milestone[] = [];
    
    combined.forEach((m, idx) => {
      result.push(m);
      
      // Inject Skills Reveal after the 2nd milestone
      if (idx === 1) {
        result.push({
          id: 'interstitial-skills-reveal',
          year: '2023-2024',
          title: 'Foundational Knowledge',
          subtitle: 'Core engineering practices acquired',
          description: 'Acquiring core programming and networking skills as the journey took off.',
          skills: ['Python', 'PHP', 'Laravel', 'MySQL', 'Linux Basics', 'Networking'],
          featured: false,
          coming_soon: false,
          type: 'skills-reveal',
          timeline_order: 1.5,
          visual_layout: 'left-text',
        });
      }
    });

    // Inject Skills Mastery before the end
    result.push({
      id: 'interstitial-skills-mastery',
      year: 'Now',
      title: 'Technical Arsenal Today',
      subtitle: 'Domain Expertise',
      description: 'Current architecture, cloud, and engineering specialties.',
      skills: [], // Will load categories dynamically
      featured: true,
      coming_soon: true,
      type: 'skills-mastery',
      timeline_order: 98,
      visual_layout: 'right-text',
    });

    // Final CTA contact milestone
    result.push({
      id: 'final-contact-cta',
      year: 'Now',
      title: "Let's Build Something Together",
      subtitle: 'Get In Touch',
      description: 'Open to interesting challenges, DevOps/MLOps integrations, or freelance consultancies.',
      skills: [],
      featured: true,
      coming_soon: true,
      type: 'contact',
      timeline_order: 99,
      visual_layout: 'left-text',
    });

    return result;
  } catch (err) {
    console.error('Failed to compile timeline milestones:', err);
    return [];
  }
}
