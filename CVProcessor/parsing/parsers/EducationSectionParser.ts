import type { EducationSection } from '@/CVProcessor/domain';
import {
  JsonValueReader,
  type ParseContext,
  type UnknownRecord,
} from '@/CVProcessor/validation';
import { BaseSectionParser, type SectionBase } from '../BaseSectionParser';
import { SectionValueParser } from '../SectionValueParser';

export class EducationSectionParser extends BaseSectionParser<
  'education-section',
  EducationSection
> {
  readonly type = 'education-section';

  protected parseContent(
    section: UnknownRecord,
    _index: number,
    base: SectionBase<'education-section'>,
    sectionContext: ParseContext,
  ): EducationSection {
    const educationsContext = sectionContext.field('educations');
    const educations = JsonValueReader.readRecordArray(
      section.educations,
      educationsContext,
    ).map((education, educationIndex) =>
      SectionValueParser.parseEducationEntry(
        education,
        educationsContext.index(educationIndex),
      ),
    );

    return {
      ...base,
      educations,
    };
  }
}
