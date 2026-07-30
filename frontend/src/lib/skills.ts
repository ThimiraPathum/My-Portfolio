export interface SkillMetaInfo {
  category: string;
  level: string;
  desc: string;
}

export const skillMeta: Record<string, SkillMetaInfo> = {};

export interface DerivedSkill {
  name: string;
  category: string;
  level: string;
  desc: string;
  usedIn: string[];
  count: number;
}

export function getDerivedSkills(): DerivedSkill[] {
  return [];
}
