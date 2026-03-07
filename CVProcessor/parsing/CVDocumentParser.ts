import type { CVDocument, SectionType } from "@/CVProcessor/domain";
import type { AppLogger } from "@/CVProcessor/logging";
import { JsonValueReader, ParseContext, ValidationRules } from "@/CVProcessor/validation";
import { CVDocumentBuilder } from "./CVDocumentBuilder";
import { SectionParserFactory } from "./SectionParserFactory";

export class CVDocumentParser {
  constructor(
    private readonly parserFactory: SectionParserFactory,
    private readonly logger: AppLogger,
  ) {}

  parse(input: unknown): CVDocument {
    const rootContext = ParseContext.root();
    const documentRecord = JsonValueReader.readRecord(input, rootContext);
    const sectionsContext = rootContext.field("sections");
    const sectionRecords = JsonValueReader.readRecordArray(
      documentRecord.sections,
      sectionsContext,
    );

    this.logger.info("canonical sections discovered", {
      sections: sectionRecords.length,
    });

    const builder = new CVDocumentBuilder();
    const sectionTypeCount = new Map<SectionType, number>();

    sectionRecords.forEach((sectionRecord, index) => {
      const sectionContext = sectionsContext.index(index);
      const sectionType = JsonValueReader.readSectionType(
        sectionRecord.type,
        sectionContext.field("type"),
      );

      this.logger.debug("section parser started", {
        sectionType,
        sectionIndex: index,
      });

      this.validateSingleInstanceSectionType(
        sectionType,
        sectionTypeCount,
        sectionContext.field("type"),
      );

      const parser = this.parserFactory.getParser(sectionType);

      try {
        const parsedSection = parser.parse(sectionRecord, index);

        builder.addSection(parsedSection);

        this.logger.info("section parser succeeded", {
          sectionType,
          sectionIndex: index,
        });
      } catch (error) {
        this.logger.error("section parser failed", {
          sectionType,
          sectionIndex: index,
          error: this.extractErrorMessage(error),
        });

        throw error;
      }
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

    if (ValidationRules.isSingleInstanceSectionType(sectionType) && nextCount > 1) {
      this.logger.warn("single-instance section duplication detected", {
        sectionType,
        count: nextCount,
      });

      throw new Error(
        `${sectionTypeContext} has duplicate ${sectionType}; it can appear only once.`,
      );
    }
  }

  private extractErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : "unknown error";
  }
}
