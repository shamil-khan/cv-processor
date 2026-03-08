import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { DevSample } from '../../samples/DevSample';

const testCases: { file: string; expectedLanguage: string }[] = [
  { file: 'cv-data/cv-data.user.EN.json', expectedLanguage: 'EN' },
  { file: 'cv-data/cv-data.user.EN.toml', expectedLanguage: 'EN' },
  { file: 'cv-data/cv-data.user.EN.yaml', expectedLanguage: 'EN' },
  { file: 'cv-data/cv-data.user.UR.json', expectedLanguage: 'UR' },
  { file: 'cv-data/cv-data.user.UR.toml', expectedLanguage: 'UR' },
  { file: 'cv-data/cv-data.user.UR.yaml', expectedLanguage: 'UR' },
];

import { type MockInstance } from 'vitest';

describe('DevSample', () => {
  let logMock: MockInstance;

  beforeEach(() => {
    logMock = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  testCases.forEach(({ file, expectedLanguage }) => {
    it(`logs sections correctly for ${expectedLanguage} document in ${file.split('.').pop()} format`, () => {
      DevSample.run(file);

      expect(logMock).toHaveBeenCalled();

      const logCalls = logMock.mock.calls.map((args: unknown[]) => args.join(' '));
      const foundSectionLog = logCalls.some((log: string) => log.includes('sections'));

      expect(foundSectionLog).toBe(true);
    });
  });
});
