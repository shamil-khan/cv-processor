import type { CVDocument } from '@/CVProcessor/domain';
import type { AppLogger } from '@/CVProcessor/logging';
import { AuthoringInputNormalizer } from '@/CVProcessor/normalization';
import { CVDocumentParser } from '@/CVProcessor/parsing';

export class CVDocumentParserFacade {
  constructor(
    private readonly sectionParser: CVDocumentParser,
    private readonly normalizer: AuthoringInputNormalizer,
    private readonly logger: AppLogger,
  ) {}

  parse(input: unknown): CVDocument {
    const sectionParser = this.sectionParser;

    if (this.isCanonicalDocument(input)) {
      this.logger.info('canonical document detected');

      try {
        const document = sectionParser.parse(input);

        this.logger.info('canonical document parsed', {
          sections: document.sections.length,
        });

        return document;
      } catch (error) {
        this.logger.error('canonical document parsing failed', {
          error: this.extractErrorMessage(error),
        });
        throw new Error('document parsing failed');
      }
    }

    this.logger.info('authoring document detected');

    try {
      const normalizer = this.normalizer;

      const document = normalizer.normalize(input);

      this.logger.info('authoring document normalized', {
        sections: document.sections.length,
      });

      return document;
    } catch (error) {
      this.logger.error('authoring document normalization failed', {
        error: this.extractErrorMessage(error),
      });
      throw new Error('document parsing failed');
    }
  }

  private isCanonicalDocument(input: unknown): boolean {
    if (!input || typeof input !== 'object' || Array.isArray(input)) {
      return false;
    }

    const record = input as Record<string, unknown>;

    return Array.isArray(record.sections);
  }

  private extractErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : 'unknown error';
  }
}
