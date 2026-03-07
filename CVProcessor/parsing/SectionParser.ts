import type { CVSection, SectionType } from "@/CVProcessor/domain";
import type { UnknownRecord } from "@/CVProcessor/validation";

export interface SectionParser<TSection extends CVSection = CVSection> {
  readonly type: SectionType;
  parse(section: UnknownRecord, index: number): TSection;
}
