import type { CVContentFormat } from './CVContentFormat';

const CONTENT_TYPE_TO_FORMAT = new Map<string, CVContentFormat>([
  ['application/json', 'json'],
  ['application/yaml', 'yaml'],
  ['application/x-yaml', 'yaml'],
  ['text/yaml', 'yaml'],
  ['text/x-yaml', 'yaml'],
  ['text/vnd.yaml', 'yaml'],
  ['application/toml', 'toml'],
  ['application/x-toml', 'toml'],
  ['text/toml', 'toml'],
]);

const EXTENSION_TO_FORMAT = new Map<string, CVContentFormat>([
  ['json', 'json'],
  ['yaml', 'yaml'],
  ['yml', 'yaml'],
  ['toml', 'toml'],
]);

export class CVContentFormatResolver {
  static resolveFromFilePath(filePath: string): CVContentFormat {
    const normalizedPath = filePath.trim().toLowerCase();
    const extension = normalizedPath.includes('.')
      ? normalizedPath.split('.').pop()
      : undefined;

    if (!extension) {
      throw new Error('content format is missing in file path.');
    }

    const format = EXTENSION_TO_FORMAT.get(extension);

    if (!format) {
      throw new Error(`unsupported file extension: .${extension}`);
    }

    return format;
  }

  static resolveFromContentType(contentType: string): CVContentFormat {
    const normalizedContentType = contentType.split(';')[0].trim().toLowerCase();

    const format = CONTENT_TYPE_TO_FORMAT.get(normalizedContentType);

    if (!format) {
      throw new Error(`unsupported content type: ${contentType}`);
    }

    return format;
  }
}
