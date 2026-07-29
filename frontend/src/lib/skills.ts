import { projectsData } from '../data/projects';

export interface SkillMetaInfo {
  category: 'frontend' | 'backend' | 'devops' | string;
  level: 'Expert' | 'Advanced' | 'Intermediate' | string;
  desc: string;
}

export const skillMeta: Record<string, SkillMetaInfo> = {
  "React":          { category: "frontend", level: "Advanced",      desc: "React 19 + Vite, used across all major projects" },
  "TypeScript":     { category: "frontend", level: "Advanced",      desc: "Typed full-stack apps with Zod validation" },
  "Tailwind CSS":   { category: "frontend", level: "Advanced",      desc: "Utility-first styling on all recent builds" },
  "Python":         { category: "backend",  level: "Advanced",      desc: "FastAPI backends, LangGraph agents, data pipelines" },
  "FastAPI":        { category: "backend",  level: "Advanced",      desc: "REST APIs with JWT auth and async endpoints" },
  "LangGraph":      { category: "backend",  level: "Advanced",      desc: "Multi-agent AI workflows for MarketMentor and Obsidian tool" },
  "PostgreSQL":     { category: "backend",  level: "Intermediate",  desc: "Schema design, queries, pgAdmin" },
  "Docker":         { category: "devops",   level: "Advanced",      desc: "Multi-stage builds and containerized deployments" },
  "GitHub Actions": { category: "devops",   level: "Advanced",      desc: "CI/CD pipelines deploying to Azure VM" },
  "Azure":          { category: "devops",   level: "Advanced",      desc: "VM provisioning, Nginx reverse proxy, domain routing" },
  "Linux":          { category: "devops",   level: "Expert",        desc: "Arch Linux daily driver — shell, systemd, networking" },
  "PHP":            { category: "backend",  level: "Intermediate",  desc: "Used in GoviMart e-commerce project" },
  "Laravel":        { category: "backend",  level: "Intermediate",  desc: "MVC backend for GoviMart" },
};

export interface DerivedSkill {
  name: string;
  category: string;
  level: 'Expert' | 'Advanced' | 'Intermediate' | string;
  desc: string;
  usedIn: string[];
  count: number;
}

export function getDerivedSkills(): DerivedSkill[] {
  const levelRank: Record<string, number> = {
    'Expert': 1,
    'Advanced': 2,
    'Intermediate': 3,
  };

  const skillNames = Object.keys(skillMeta);

  const skillsList: DerivedSkill[] = skillNames.map((name) => {
    const meta = skillMeta[name];
    const matchingProjects = projectsData.filter((p) =>
      p.tech.some((t) => t.toLowerCase() === name.toLowerCase())
    );
    const usedIn = matchingProjects.map((p) => p.title);

    return {
      name,
      category: meta.category,
      level: meta.level,
      desc: meta.desc,
      usedIn,
      count: usedIn.length,
    };
  });

  return skillsList.sort((a, b) => {
    const rankA = levelRank[a.level] ?? 99;
    const rankB = levelRank[b.level] ?? 99;
    if (rankA !== rankB) return rankA - rankB;
    return b.count - a.count;
  });
}
