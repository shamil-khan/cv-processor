import type { CVDocument, SectionType } from "@/CVProcessor/domain";
import { JsonValueReader, ParseContext, ValidationRules } from "@/CVProcessor/validation";
import { CVDocumentBuilder } from "./CVDocumentBuilder";
import { SectionParserFactory } from "./SectionParserFactory";

export class CVDocumentParser {
  constructor(private readonly parserFactory: SectionParserFactory) {}

  parse(input: unknown): CVDocument {
    const rootContext = ParseContext.root();
    const documentRecord = JsonValueReader.readRecord(input, rootContext);
    const sectionsContext = rootContext.field("sections");
    const sectionRecords = JsonValueReader.readRecordArray(
      documentRecord.sections,
      sectionsContext,
    );
    const builder = new CVDocumentBuilder();
    const sectionTypeCount = new Map<SectionType, number>();

    sectionRecords.forEach((sectionRecord, index) => {
      const sectionContext = sectionsContext.index(index);
      const sectionType = JsonValueReader.readSectionType(
        sectionRecord.type,
        sectionContext.field("type"),
      );

      this.validateSingleInstanceSectionType(
        sectionType,
        sectionTypeCount,
        sectionContext.field("type"),
      );

      const parser = this.parserFactory.getParser(sectionType);

      builder.addSection(parser.parse(sectionRecord, index));
    });

    return builder.build();
  }

  private validateSingleInstanceSectionType(
    sectionType: SectionType,
    sectionTypeCount: Map<SectionType, number>,
    sectionTypeContext: ParseContext,
  ): void {
    const nextCount = (sectionTypeCount.get(sectionType) ?? 0) + 1;
    sectionTypeCount.set(sectionType, nextCount);

    if (
      ValidationRules.isSingleInstanceSectionType(sectionType) &&
      nextCount > 1
    ) {
      throw new Error(
        `${sectionTypeContext} has duplicate ${sectionType}; it can appear only once.`,
      );
    }
  }
}
