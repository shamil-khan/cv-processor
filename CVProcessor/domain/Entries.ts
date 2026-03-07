import type { Duration, SocialEntry } from "./Shared";

export interface Personal {
  name: string;
  titles: string[];
  location: string;
  phone: string;
  email: string;
  photo?: string;
  social: SocialEntry[];
}

export interface LabelValues {
  label: string;
  values: string[];
}

export interface LabelValue2 {
  label: string;
  value1: string;
  value2: string;
}

export interface LabelValue1 {
  label: string;
  value: string;
}

export interface EducationEntry {
  institution: string;
  degree: string;
  field: string;
  location: string;
  country: string;
  duration: Duration;
  courses: string[];
  highlights: string[];
}

export interface ExperienceEntry {
  position: string;
  company: string;
  location: string;
  country: string;
  duration: Duration;
  techs: LabelValues[];
  highlights: string[];
}

export interface ProjectEntry {
  name?: string;
  title?: string;
  logo?: string;
  detail?: string;
  githubRepo?: string;
  techs: string[];
  snapshot?: string;
}

export interface CertificationEntry {
  title?: string;
  year?: string;
  logo?: string;
  issuer?: string;
  onlineLink?: string;
}
