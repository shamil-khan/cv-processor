import { describe, expect, it } from 'vitest';
import { BackendSample } from '../../samples/BackendSample';
import { loadTextFixture } from '../helpers/fixtureLoader';
import type { CVContentFormat } from '@/CVProcessor/deserialization';

const testCases: { file: string; format: CVContentFormat; expectedLanguage: string }[] = [
  { file: 'cv-data/cv-data.user.EN.json', format: 'json', expectedLanguage: 'EN' },
  { file: 'cv-data/cv-data.user.EN.toml', format: 'toml', expectedLanguage: 'EN' },
  { file: 'cv-data/cv-data.user.EN.yaml', format: 'yaml', expectedLanguage: 'EN' },
  { file: 'cv-data/cv-data.user.UR.json', format: 'json', expectedLanguage: 'UR' },
  { file: 'cv-data/cv-data.user.UR.toml', format: 'toml', expectedLanguage: 'UR' },
  { file: 'cv-data/cv-data.user.UR.yaml', format: 'yaml', expectedLanguage: 'UR' },
];

describe('BackendSample', () => {
  const backendSample = new BackendSample();

  testCases.forEach(({ file, format, expectedLanguage }) => {
    it(`parses ${expectedLanguage} document in ${format} format`, () => {
      const content = loadTextFixture(file);
      const document = backendSample.process(content, format);

      expect(document).toBeDefined();
      expect(document.sections.length).toBeGreaterThan(0);
      expect(document.sections[0]?.type).toBe('personal-section');
    });
  });
});
