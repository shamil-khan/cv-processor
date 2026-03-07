import type { CertificationsSection } from '@/CVProcessor/domain';
import {
  JsonValueReader,
  type ParseContext,
  type UnknownRecord,
} from '@/CVProcessor/validation';
import { BaseSectionParser, type SectionBase } from '../BaseSectionParser';
import { SectionValueParser } from '../SectionValueParser';

export class CertificationsSectionParser extends BaseSectionParser<
  'certifications-section',
  CertificationsSection
> {
  readonly type = 'certifications-section';

  protected parseContent(
    section: UnknownRecord,
    _index: number,
    base: SectionBase<'certifications-section'>,
    sectionContext: ParseContext,
  ): CertificationsSection {
    const certificationsContext = sectionContext.field('certifications');
    const certifications = JsonValueReader.readRecordArray(
      section.certifications,
      certificationsContext,
    ).map((certification, certificationIndex) =>
      SectionValueParser.parseCertificationEntry(
        certification,
        certificationsContext.index(certificationIndex),
      ),
    );

    return {
      ...base,
      certifications,
    };
  }
}
