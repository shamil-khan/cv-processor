import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

export function loadTextFixture(relativePath: string): string {
  return readFileSync(resolve(process.cwd(), relativePath), 'utf8');
}

export function loadJsonFixture(relativePath: string): unknown {
  return JSON.parse(loadTextFixture(relativePath));
}
