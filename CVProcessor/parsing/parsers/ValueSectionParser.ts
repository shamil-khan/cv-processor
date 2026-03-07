import type { ValueSection } from '@/CVProcessor/domain';
import {
  JsonValueReader,
  type ParseContext,
  type UnknownRecord,
} from '@/CVProcessor/validation';
import { BaseSectionParser, type SectionBase } from '../BaseSectionParser';

export class ValueSectionParser extends BaseSectionParser<'value-section', ValueSection> {
  readonly type = 'value-section';

  protected parseContent(
    section: UnknownRecord,
    _index: number,
    base: SectionBase<'value-section'>,
    sectionContext: ParseContext,
  ): ValueSection {
    return {
      ...base,
      value: JsonValueReader.readString(section.value, sectionContext.field('value')),
    };
  }
}
