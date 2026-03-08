import { createCVProcessor, type CVContentFormat, type CVDocument } from '../CVProcessor';

export class WebSample {
  /**
   * Simulates fetching CV data from a REST endpoint and parsing it in a browser environment.
   */
  async loadAndParse(url: string, format: CVContentFormat): Promise<CVDocument> {
    // eslint-disable-next-line no-undef
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch CV from ${url}`);
    }
    const content = await response.text();
    const processor = createCVProcessor();
    return processor.parseContent(content, format);
  }
}
