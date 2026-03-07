import {
  CVContentDeserializerFactory,
  type CVContentFormat,
  CVContentFormatResolver,
} from "@/CVProcessor/deserialization";
import type { CVDocument } from "@/CVProcessor/domain";
import { LoggerFactory, type AppLogger } from "@/CVProcessor/logging";
import { CVDocumentParserFacade } from "./CVDocumentParserFacade";

export class CVDocumentContentParserFacade {
  constructor(
    private readonly deserializerFactory: CVContentDeserializerFactory = CVContentDeserializerFactory.createDefault(),
    private readonly logger: AppLogger = LoggerFactory.getLogger(
      "CVDocumentContentParserFacade",
    ),
  ) {}

  parse(content: string, format: CVContentFormat): CVDocument {
    this.logger.info("content parsing started", {
      format,
      contentLength: content.length,
    });

    try {
      const deserializer = this.deserializerFactory.getDeserializer(format);
      const rawDocument = deserializer.deserialize(content);
      const parsedDocument = CVDocumentParserFacade.parse(rawDocument);

      this.logger.info("content parsing succeeded", {
        format,
        sections: parsedDocument.sections.length,
      });

      return parsedDocument;
    } catch (error) {
      this.logger.error("content parsing failed", {
        format,
        error: this.extractErrorMessage(error),
      });
      throw new Error("document parsing failed");
    }
  }

  parseByFilePath(content: string, filePath: string): CVDocument {
    const format = CVContentFormatResolver.resolveFromFilePath(filePath);

    this.logger.debug("content format resolved from file path", {
      filePath,
      format,
    });

    return this.parse(content, format);
  }

  parseByContentType(content: string, contentType: string): CVDocument {
    const format = CVContentFormatResolver.resolveFromContentType(contentType);

    this.logger.debug("content format resolved from content type", {
      contentType,
      format,
    });

    return this.parse(content, format);
  }

  private extractErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : "unknown error";
  }
}
