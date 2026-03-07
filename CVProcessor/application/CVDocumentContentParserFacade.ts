import {
  CVContentDeserializerFactory,
  type CVContentFormat,
  CVContentFormatResolver,
} from "@/CVProcessor/deserialization";
import type { CVDocument } from "@/CVProcessor/domain";
import { CVDocumentParserFacade } from "./CVDocumentParserFacade";

export class CVDocumentContentParserFacade {
  constructor(
    private readonly deserializerFactory: CVContentDeserializerFactory = CVContentDeserializerFactory.createDefault(),
  ) {}

  parse(content: string, format: CVContentFormat): CVDocument {
    try {
      const deserializer = this.deserializerFactory.getDeserializer(format);
      const rawDocument = deserializer.deserialize(content);

      return CVDocumentParserFacade.parse(rawDocument);
    } catch {
      throw new Error("document parsing failed");
    }
  }

  parseByFilePath(content: string, filePath: string): CVDocument {
    const format = CVContentFormatResolver.resolveFromFilePath(filePath);

    return this.parse(content, format);
  }

  parseByContentType(content: string, contentType: string): CVDocument {
    const format = CVContentFormatResolver.resolveFromContentType(contentType);

    return this.parse(content, format);
  }
}
