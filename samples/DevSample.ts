import { createCVProcessor } from '../CVProcessor';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

export class DevSample {
  /**
   * Simple developer usage script sample.
   */
  static run(filePath: string): void {
    const absolutePath = resolve(process.cwd(), filePath);
    const rawContent = readFileSync(absolutePath, 'utf8');

    const processor = createCVProcessor();
    const document = processor.parseByFilePath(rawContent, filePath);

    console.log(`Parsed CV Document with ${document.sections.length} sections`);
  }
}
