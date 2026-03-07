import type { CVContentFormat } from './CVContentFormat';

export interface CVContentDeserializer {
  readonly format: CVContentFormat;
  deserialize(content: string): unknown;
}
