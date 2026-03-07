import type { Duration, SocialEntry } from "./Shared";

export interface Personal {
  name: string;
  titles: string[];
  location: string;
  phone: string;
  email: string;
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
