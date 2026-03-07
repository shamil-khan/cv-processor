import type { InterestsSection } from "@/CVProcessor/domain";
import {
  JsonValueReader,
  type ParseContext,
  type UnknownRecord,
} from "@/CVProcessor/validation";
import { BaseSectionParser, type SectionBase } from "../BaseSectionParser";

export class InterestsSectionParser extends BaseSectionParser<
  "interests-section",
  InterestsSection
> {
  readonly type = "interests-section";

  protected parseContent(
    section: UnknownRecord,
    _index: number,
    base: SectionBase<"interests-section">,
    sectionContext: ParseContext,
  ): InterestsSection {
    const items = JsonValueReader.readStringArray(
      section.items,
      sectionContext.field("items"),
    );

    return {
      ...base,
      items,
    };
  }
}
