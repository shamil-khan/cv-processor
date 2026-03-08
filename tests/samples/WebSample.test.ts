import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { WebSample } from '../../samples/WebSample';
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

import { type MockInstance } from 'vitest';

describe('WebSample', () => {
  let webSample: WebSample;
  let fetchMock: MockInstance;

  beforeEach(() => {
    webSample = new WebSample();
    fetchMock = vi.spyOn(globalThis, 'fetch');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  testCases.forEach(({ file, format, expectedLanguage }) => {
    it(`fetches and parses ${expectedLanguage} document in ${format} format`, async () => {
      const content = loadTextFixture(file);

      fetchMock.mockResolvedValue({
        ok: true,
        text: async () => content,
      });

      const url = `https://mock-api.com/cv?lang=${expectedLanguage}&format=${format}`;
      const document = await webSample.loadAndParse(url, format);

      expect(fetchMock).toHaveBeenCalledWith(url);
      expect(document).toBeDefined();
      expect(document.sections.length).toBeGreaterThan(0);
      expect(document.sections[0]?.type).toBe('personal-section');
    });
  });

  it('throws an error on failed fetch', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
    });

    const url = 'https://mock-api.com/not-found';
    await expect(webSample.loadAndParse(url, 'json')).rejects.toThrow(
      /Failed to fetch CV/,
    );
  });
  it('throws an error if fetched content does not match specified format', async () => {
    // Provide YAML content but parse it as JSON
    const yamlContent = loadTextFixture('cv-data/cv-data.user.EN.yaml');

    fetchMock.mockResolvedValue({
      ok: true,
      text: async () => yamlContent,
    });

    const url = 'https://mock-api.com/cv?lang=EN&format=json';

    // WebSample will attempt to parse YAML as JSON which should result in a deserialization error
    await expect(webSample.loadAndParse(url, 'json')).rejects.toThrow();
  });
});
