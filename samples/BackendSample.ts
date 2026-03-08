import { createCVProcessor, type CVContentFormat, type CVDocument } from '../CVProcessor';

export class BackendSample {
  /**
   * Simulates processing an uploaded CV file and returning the parsed CVDocument structure.
   */
  process(content: string, format: CVContentFormat): CVDocument {
    const processor = createCVProcessor();
    return processor.parseContent(content, format);
  }
}
