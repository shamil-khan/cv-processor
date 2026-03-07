import type { LabelValuesSection } from '@/CVProcessor/domain';
import {
  JsonValueReader,
  type ParseContext,
  type UnknownRecord,
} from '@/CVProcessor/validation';
import { BaseSectionParser, type SectionBase } from '../BaseSectionParser';
import { SectionValueParser } from '../SectionValueParser';

export class LabelValuesSectionParser extends BaseSectionParser<
  'label-values-section',
  LabelValuesSection
> {
  readonly type = 'label-values-section';

  protected parseContent(
    section: UnknownRecord,
    _index: number,
    base: SectionBase<'label-values-section'>,
    sectionContext: ParseContext,
  ): LabelValuesSection {
    const labelsContext = sectionContext.field('labels');
    const labels = JsonValueReader.readRecordArray(section.labels, labelsContext).map(
      (label, labelIndex) =>
        SectionValueParser.parseLabelValues(label, labelsContext.index(labelIndex)),
    );

    return {
      ...base,
      labels,
    };
  }
}
