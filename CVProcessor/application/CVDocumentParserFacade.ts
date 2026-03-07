import type { CVDocument } from "@/CVProcessor/domain";
import {
  AuthoringInputNormalizer,
  AuthoringProfileRegistry,
} from "@/CVProcessor/normalization";
import { CVDocumentParser, SectionParserFactory } from "@/CVProcessor/parsing";

export class CVDocumentParserFacade {
  static parse(input: unknown): CVDocument {
    const sectionParser = new CVDocumentParser(SectionParserFactory.createDefault());

    if (this.isCanonicalDocument(input)) {
      try {
        return sectionParser.parse(input);
      } catch {
        throw new Error("document parsing failed");
      }
    }

    try {
      const normalizer = new AuthoringInputNormalizer(
        AuthoringProfileRegistry.createDefault(),
      );

      return normalizer.normalize(input);
    } catch {
      throw new Error("document parsing failed");
    }
  }

  private static isCanonicalDocument(input: unknown): boolean {
    if (!input || typeof input !== "object" || Array.isArray(input)) {
      return false;
    }

    const record = input as Record<string, unknown>;

    return Array.isArray(record.sections);
  }
}
