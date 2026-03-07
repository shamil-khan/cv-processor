import type { LabelValue1Section } from '@/CVProcessor/domain';
import type { ParseContext, UnknownRecord } from '@/CVProcessor/validation';
import { BaseSectionParser, type SectionBase } from '../BaseSectionParser';
import { SectionValueParser } from '../SectionValueParser';

export class LabelValue1SectionParser extends BaseSectionParser<
  'label-value1-section',
  LabelValue1Section
> {
  readonly type = 'label-value1-section';

  protected parseContent(
    section: UnknownRecord,
    _index: number,
    base: SectionBase<'label-value1-section'>,
    sectionContext: ParseContext,
  ): LabelValue1Section {
    const labelsContext = sectionContext.field('labels');
    const labelCollection = SectionValueParser.parseLabelCollection(
      section,
      sectionContext,
    );
    const labels = labelCollection.map((label, labelIndex) =>
      SectionValueParser.parseLabelValue1(label, labelsContext.index(labelIndex)),
    );

    return {
      ...base,
      labels,
    };
  }
}
