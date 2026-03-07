import type {
  EducationEntry,
  ExperienceEntry,
  LabelValue1,
  LabelValue2,
  LabelValues,
  Personal,
} from "./Entries";

export type SectionType =
  | "personal-section"
  | "experience-section"
  | "education-section"
  | "value-section"
  | "label-value1-section"
  | "label-value2-section"
  | "label-values-section";

export interface ISection {
  type: SectionType;
  id: string;
  name: string;
  title: string;
}

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

export interface EducationSection extends ISection {
  type: "education-section";
  educations: EducationEntry[];
}

export type EductionSection = EducationSection;

export interface LabelValue2Section extends ISection {
  type: "label-value2-section";
  labels: LabelValue2[];
}

export interface LabelValue1Section extends ISection {
  type: "label-value1-section";
  labels: LabelValue1[];
}

export type CVSection =
  | PersonalSection
  | ExperienceSection
  | EducationSection
  | ValueSection
  | LabelValue1Section
  | LabelValue2Section
  | LabelValuesSection;
