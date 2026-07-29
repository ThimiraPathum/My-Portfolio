export interface ProjectData {
  id: string;
  title: string;
  description: string;
  category: string;
  tech: string[];
  featured?: boolean;
  coming_soon?: boolean;
  github_url?: string;
  live_url?: string;
  image_url?: string;
}

export const projectsData: ProjectData[] = [
  {
    id: 'market-mentor',
    title: 'MarketMentor',
    description: 'AI-driven financial market intelligence and analytics platform featuring multi-agent workflows and async endpoints.',
    category: 'Backend & AI',
    tech: ["React", "TypeScript", "FastAPI", "Python", "LangGraph", "Docker", "PostgreSQL", "GitHub Actions"],
    featured: true,
  },
  {
    id: 'portfolio',
    title: 'Portfolio (thimiradev.me)',
    description: 'Personal developer portfolio website and CMS built with modern React, Tailwind CSS, and cloud infrastructure.',
    category: 'Frontend',
    tech: ["React", "TypeScript", "Tailwind CSS", "GitHub Actions", "Azure", "Nginx"],
    featured: true,
  },
  {
    id: 'obsidian-ai',
    title: 'Obsidian AI Note Generator',
    description: 'Automated note generation and knowledge synthesis tool running local LLMs and agentic graph workflows.',
    category: 'Backend & AI',
    tech: ["Python", "LangGraph", "Ollama"],
    featured: false,
  },
  {
    id: 'govimart',
    title: 'GoviMart',
    description: 'Agri-tech e-commerce platform facilitating direct trade between produce vendors and consumers.',
    category: 'Backend',
    tech: ["PHP", "Laravel", "MySQL"],
    featured: false,
  },
  {
    id: 'greenhouse-rover',
    title: 'Greenhouse Monitoring Rover',
    description: 'Autonomous micro-rover system for real-time greenhouse climate telemetry and sensor data collection.',
    category: 'IoT',
    tech: ["Arduino", "ESP8266"],
    featured: false,
  },
];
