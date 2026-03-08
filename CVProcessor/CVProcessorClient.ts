import type { CVDocumentContentParserFacade } from '@/CVProcessor/application';
import type { CVDocument } from '@/CVProcessor/domain';
import { createCVProcessorContainer } from '@/CVProcessor/di';
import type { CVContentFormat } from '@/CVProcessor/deserialization';

export interface CVProcessorApi {
  parseContent(content: string, format: CVContentFormat): CVDocument;
  parseByFilePath(content: string, filePath: string): CVDocument;
  parseByContentType(content: string, contentType: string): CVDocument;
}

export class CVProcessorClient implements CVProcessorApi {
  constructor(private readonly parserFacade: CVDocumentContentParserFacade) {}

  static create(): CVProcessorClient {
    const container = createCVProcessorContainer();
    return new CVProcessorClient(container.cradle.cvDocumentContentParserFacade);
  }

  parseContent(content: string, format: CVContentFormat): CVDocument {
    return this.parserFacade.parse(content, format);
  }

  parseByFilePath(content: string, filePath: string): CVDocument {
    return this.parserFacade.parseByFilePath(content, filePath);
  }

  parseByContentType(content: string, contentType: string): CVDocument {
    return this.parserFacade.parseByContentType(content, contentType);
  }
}

export function createCVProcessor(): CVProcessorApi {
  return CVProcessorClient.create();
}
