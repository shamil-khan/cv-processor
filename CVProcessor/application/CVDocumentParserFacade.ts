import type { CVDocument } from "@/CVProcessor/domain";
import { CVDocumentParser, SectionParserFactory } from "@/CVProcessor/parsing";

export class CVDocumentParserFacade {
  static parse(input: unknown): CVDocument {
    try {
      const parser = new CVDocumentParser(SectionParserFactory.createDefault());
      return parser.parse(input);
    } catch {
      throw new Error("document parsing failed");
    }
  }
}
