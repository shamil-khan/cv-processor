import type { SectionType } from "@/CVProcessor/domain";

export const SECTION_TYPES: readonly SectionType[] = [
  "personal-section",
  "experience-section",
  "education-section",
  "value-section",
  "label-value1-section",
  "label-value2-section",
  "label-values-section",
];

export const SINGLE_INSTANCE_SECTION_TYPES: readonly SectionType[] = [
  "personal-section",
  "education-section",
  "experience-section",
];

export class ValidationRules {
  static isNonEmptyString(value: unknown): value is string {
    return typeof value === "string" && value.trim().length > 0;
  }

  static isSectionType(value: unknown): value is SectionType {
    return typeof value === "string" && SECTION_TYPES.includes(value as SectionType);
  }

  static isSingleInstanceSectionType(value: SectionType): boolean {
    return SINGLE_INSTANCE_SECTION_TYPES.includes(value);
  }
}
