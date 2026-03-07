import type { CVDocument } from "@/CVProcessor/domain";
import { LoggerFactory } from "@/CVProcessor/logging";
import {
  AuthoringInputNormalizer,
  AuthoringProfileRegistry,
} from "@/CVProcessor/normalization";
import { CVDocumentParser, SectionParserFactory } from "@/CVProcessor/parsing";

export class CVDocumentParserFacade {
  private static readonly logger = LoggerFactory.getLogger("CVDocumentParserFacade");

  static parse(input: unknown): CVDocument {
    const sectionParser = new CVDocumentParser(SectionParserFactory.createDefault());

    if (this.isCanonicalDocument(input)) {
      this.logger.info("canonical document detected");

      try {
        const document = sectionParser.parse(input);

        this.logger.info("canonical document parsed", {
          sections: document.sections.length,
        });

        return document;
      } catch (error) {
        this.logger.error("canonical document parsing failed", {
          error: this.extractErrorMessage(error),
        });
        throw new Error("document parsing failed");
      }
    }

    this.logger.info("authoring document detected");

    try {
      const normalizer = new AuthoringInputNormalizer(
        AuthoringProfileRegistry.createDefault(),
      );

      const document = normalizer.normalize(input);

      this.logger.info("authoring document normalized", {
        sections: document.sections.length,
      });

      return document;
    } catch (error) {
      this.logger.error("authoring document normalization failed", {
        error: this.extractErrorMessage(error),
      });
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

  private static extractErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : "unknown error";
  }
}
