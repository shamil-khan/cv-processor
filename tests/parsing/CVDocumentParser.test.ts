import { CVDocumentParser, SectionParserFactory } from '@/CVProcessor/parsing';
import { describe, expect, it } from 'vitest';
import { loadJsonFixture } from '../helpers/fixtureLoader';
import { InMemoryLogger } from '../helpers/InMemoryLogger';

describe('CVDocumentParser', () => {
  it('parses canonical document using registered section parsers', () => {
    const logger = new InMemoryLogger();
    const parser = new CVDocumentParser(SectionParserFactory.createDefault(), logger);
    const input = loadJsonFixture('cv-data/cv-data.ENG.json');

    const document = parser.parse(input);

    expect(document.sections.length).toBeGreaterThan(0);
    expect(document.sections[0]?.type).toBe('personal-section');

    const infoLogs = logger.entries
      .filter((entry) => entry.level === 'info')
      .map((entry) => entry.message);

    expect(infoLogs).toContain('canonical sections discovered');
    expect(infoLogs).toContain('section parser succeeded');
  });

  it('rejects duplicate single-instance sections', () => {
    const logger = new InMemoryLogger();
    const parser = new CVDocumentParser(SectionParserFactory.createDefault(), logger);
    const personalSection = {
      type: 'personal-section',
      name: 'Home',
      title: 'Home',
      info: {
        name: 'Simple Name',
        titles: ['Principal Software Engineer'],
        location: 'Austin, TX',
        phone: '+1 (512) 555-0189',
        email: 'simple@example.com',
        social: [{ linkedin: 'linkedin.com/in/simple-name' }],
      },
    };

    expect(() =>
      parser.parse({
        sections: [
          personalSection,
          {
            ...personalSection,
            name: 'Home Duplicate',
            title: 'Home Duplicate',
          },
        ],
      }),
    ).toThrow(/duplicate personal-section/);

    const warningLogs = logger.entries.filter((entry) => entry.level === 'warn');

    expect(
      warningLogs.some(
        (entry) => entry.message === 'single-instance section duplication detected',
      ),
    ).toBe(true);
  });
});
