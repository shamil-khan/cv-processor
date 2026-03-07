import type { PersonalSection } from "@/CVProcessor/domain";
import type { ParseContext, UnknownRecord } from "@/CVProcessor/validation";
import { BaseSectionParser, type SectionBase } from "../BaseSectionParser";
import { SectionValueParser } from "../SectionValueParser";

export class PersonalSectionParser extends BaseSectionParser<
  "personal-section",
  PersonalSection
> {
  readonly type = "personal-section";

  protected parseContent(
    section: UnknownRecord,
    _index: number,
    base: SectionBase<"personal-section">,
    sectionContext: ParseContext,
  ): PersonalSection {
    return {
      ...base,
      info: SectionValueParser.parsePersonal(section.info, sectionContext.field("info")),
    };
  }
}
