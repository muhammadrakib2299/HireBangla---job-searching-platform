import { SkillProficiency } from './enums';

export type ResumeTemplate = 'classic' | 'modern' | 'minimal';

export interface ResumePersonalInfo {
  fullName: string;
  email: string;
  phone?: string;
  location?: string;
  headline?: string;
  linkedin?: string;
  github?: string;
  website?: string;
}

export interface ResumeExperience {
  company: string;
  position: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  description?: string;
}

export interface ResumeEducation {
  institution: string;
  degree: string;
  fieldOfStudy?: string;
  startDate: string;
  endDate?: string;
  grade?: string;
}

export interface ResumeSkill {
  name: string;
  proficiency?: SkillProficiency;
}

export interface ResumeLanguage {
  name: string;
  proficiency: string;
}

export interface ResumeCertification {
  name: string;
  issuer?: string;
  date?: string;
  url?: string;
}

export interface ResumeProject {
  name: string;
  description?: string;
  url?: string;
  technologies?: string[];
}

export interface IResume {
  _id: string;
  userId: string;
  title: string;
  template: ResumeTemplate;
  personalInfo: ResumePersonalInfo;
  summary?: string;
  experience: ResumeExperience[];
  education: ResumeEducation[];
  skills: ResumeSkill[];
  languages: ResumeLanguage[];
  certifications: ResumeCertification[];
  projects: ResumeProject[];
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}
