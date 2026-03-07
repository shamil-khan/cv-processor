import type { CVSection, SectionType } from '@/CVProcessor/domain';
import {
  JsonValueReader,
  ParseContext,
  type UnknownRecord,
} from '@/CVProcessor/validation';
import type { SectionParser } from './SectionParser';

export type SectionBase<TType extends SectionType> = {
  type: TType;
  id: string;
  name: string;
  title: string;
};

export abstract class BaseSectionParser<
  TType extends SectionType,
  TSection extends CVSection & { type: TType },
> implements SectionParser<TSection> {
  abstract readonly type: TType;

  parse(section: UnknownRecord, index: number): TSection {
    const sectionContext = this.createSectionContext(index);
    const base = this.parseSectionBase(section, index, sectionContext);

    return this.parseContent(section, index, base, sectionContext);
  }

  private createSectionContext(index: number): ParseContext {
    return ParseContext.root().field('sections').index(index);
  }

  private parseSectionBase(
    section: UnknownRecord,
    index: number,
    sectionContext: ParseContext,
  ): SectionBase<TType> {
    const id =
      typeof section.id === 'string' && section.id.trim().length > 0
        ? section.id
        : `${this.type}-${index + 1}`;

    return {
      type: this.type,
      id,
      name: JsonValueReader.readString(section.name, sectionContext.field('name')),
      title: JsonValueReader.readString(section.title, sectionContext.field('title')),
    };
  }

  protected abstract parseContent(
    section: UnknownRecord,
    index: number,
    base: SectionBase<TType>,
    sectionContext: ParseContext,
  ): TSection;
}
