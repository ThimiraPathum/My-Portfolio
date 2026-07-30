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

export const projectsData: ProjectData[] = [];
