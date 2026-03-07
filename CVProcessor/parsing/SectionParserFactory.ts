import type { SectionType } from '@/CVProcessor/domain';
import {
  CertificationsSectionParser,
  EducationSectionParser,
  ExperienceSectionParser,
  InterestsSectionParser,
  LabelValue1SectionParser,
  LabelValue2SectionParser,
  LabelValuesSectionParser,
  PersonalSectionParser,
  ProjectsSectionParser,
  ValueSectionParser,
} from './parsers';
import type { SectionParser } from './SectionParser';

export class SectionParserFactory {
  private readonly parserRegistry = new Map<SectionType, SectionParser>();

  constructor(parsers: SectionParser[]) {
    for (const parser of parsers) {
      this.parserRegistry.set(parser.type, parser);
    }
  }

  static createDefault(): SectionParserFactory {
    return new SectionParserFactory([
      new PersonalSectionParser(),
      new ValueSectionParser(),
      new LabelValuesSectionParser(),
      new ExperienceSectionParser(),
      new EducationSectionParser(),
      new ProjectsSectionParser(),
      new CertificationsSectionParser(),
      new InterestsSectionParser(),
      new LabelValue2SectionParser(),
      new LabelValue1SectionParser(),
    ]);
  }

  getParser(sectionType: SectionType): SectionParser {
    const parser = this.parserRegistry.get(sectionType);

    if (!parser) {
      throw new Error(`parser for ${sectionType} is not registered.`);
    }

    return parser;
  }
}
