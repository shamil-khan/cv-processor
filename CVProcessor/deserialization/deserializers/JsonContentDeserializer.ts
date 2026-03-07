import type { CVContentDeserializer } from '../CVContentDeserializer';

export class JsonContentDeserializer implements CVContentDeserializer {
  readonly format = 'json' as const;

  deserialize(content: string): unknown {
    try {
      return JSON.parse(content);
    } catch {
      throw new Error('json parsing failed');
    }
  }
}
