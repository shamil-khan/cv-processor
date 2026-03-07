import type { ExperienceSection } from "@/CVProcessor/domain";
import { JsonValueReader, type ParseContext, type UnknownRecord } from "@/CVProcessor/validation";
import { BaseSectionParser, type SectionBase } from "../BaseSectionParser";
import { SectionValueParser } from "../SectionValueParser";

export class ExperienceSectionParser extends BaseSectionParser<
  "experience-section",
  ExperienceSection
> {
  readonly type = "experience-section";

  protected parseContent(
    section: UnknownRecord,
    _index: number,
    base: SectionBase<"experience-section">,
    sectionContext: ParseContext,
  ): ExperienceSection {
    const experiencesContext = sectionContext.field("experiences");
    const experiences = JsonValueReader.readRecordArray(
      section.experiences,
      experiencesContext,
    ).map((experience, experienceIndex) =>
      SectionValueParser.parseExperienceEntry(
        experience,
        experiencesContext.index(experienceIndex),
      ),
    );

    return {
      ...base,
      experiences,
    };
  }
}
