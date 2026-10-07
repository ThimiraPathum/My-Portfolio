export interface Project {
  id: number; title: string; description: string; category: string;
  image_url: string | null; video_url: string | null; gallery: string[] | null;
  tech_stack: string[]; github_url: string | null; live_url: string | null;
  featured: boolean; coming_soon: boolean; order: number;
  timeline_order?: number; milestone_year?: string; visual_layout?: 'left-text' | 'right-text' | 'auto';
}
export interface Experience {
  id: number; company: string; role: string; description: string;
  location: string; start_date: string | null; end_date: string | null;
  current: boolean; tech_stack: string[]; order: number;
  certificate_url: string | null; credential_link: string | null;
  featured: boolean; timeline_order?: number; milestone_year?: string;
  visual_layout?: 'left-text' | 'right-text' | 'auto';
}
export interface Comment {
  id: number; blog_id: number; name: string; email?: string; body: string;
  approved: boolean; created_at: string; blog?: { title: string; slug: string };
}
export interface Blog {
  id: number; title: string; slug: string; excerpt: string; content: string;
  status: 'draft' | 'published'; coming_soon: boolean; cover_image: string | null;
  created_at: string; published_at: string | null; comments?: Comment[];
}
export interface Message {
  id: number; name: string; email: string; subject: string; message: string;
  read: boolean; created_at: string;
}
export interface DerivedSkill { name: string; used_in: { id: number; title: string }[] }
