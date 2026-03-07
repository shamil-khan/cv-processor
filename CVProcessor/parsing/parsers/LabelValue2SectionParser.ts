import type { LabelValue2Section } from '@/CVProcessor/domain';
import type { ParseContext, UnknownRecord } from '@/CVProcessor/validation';
import { BaseSectionParser, type SectionBase } from '../BaseSectionParser';
import { SectionValueParser } from '../SectionValueParser';

export class LabelValue2SectionParser extends BaseSectionParser<
  'label-value2-section',
  LabelValue2Section
> {
  readonly type = 'label-value2-section';

  protected parseContent(
    section: UnknownRecord,
    _index: number,
    base: SectionBase<'label-value2-section'>,
    sectionContext: ParseContext,
  ): LabelValue2Section {
    const labelsContext = sectionContext.field('labels');
    const labelCollection = SectionValueParser.parseLabelCollection(
      section,
      sectionContext,
    );
    const labels = labelCollection.map((label, labelIndex) =>
      SectionValueParser.parseLabelValue2(label, labelsContext.index(labelIndex)),
    );

    return {
      ...base,
      labels,
    };
  }
}
