export interface SocialEntry {
  [key: string]: string;
}

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

export interface Duration {
  from: string;
  to: string;
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

export interface ISection {
  type: string;
  id: string;
  name: string;
  title: string;
}

export type SectionType =
  | "personal-section"
  | "experience-section"
  | "education-section"
  | "value-section"
  | "label-value1-section"
  | "label-value2-section"
  | "label-values-section";

export interface PersonalSection extends ISection {
  type: "personal-section";
  info: Personal;
}

export interface ValueSection extends ISection {
  type: "value-section";
  value: string;
}

export interface LabelValuesSection extends ISection {
  type: "label-values-section";
  labels: LabelValues[];
}

export interface ExperienceSection extends ISection {
  type: "experience-section";
  experiences: ExperienceEntry[];
}

export interface EductionSection extends ISection {
  type: "education-section";
  educations: EducationEntry[];
}

export interface LabelValue2Section extends ISection {
  type: "label-value2-section";
  labels: LabelValue2[];
}

export interface LabelValue1Section extends ISection {
  type: "label-value1-section";
  labels: LabelValue1[];
}

export interface CVDocument {
  sections: ISection[];
}
