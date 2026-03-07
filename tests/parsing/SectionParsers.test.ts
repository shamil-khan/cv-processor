import {
  CertificationsSectionParser,
  EducationSectionParser,
  ExperienceSectionParser,
  InterestsSectionParser,
  LabelValue1SectionParser,
  LabelValue2SectionParser,
  LabelValuesSectionParser,
  PersonalSectionParser,
  ProjectsSectionParser,
  ValueSectionParser,
} from '@/CVProcessor/parsing';
import type { UnknownRecord } from '@/CVProcessor/validation';
import { describe, expect, it } from 'vitest';

function sectionBase(name = 'Section', title = 'Section'): UnknownRecord {
  return {
    name,
    title,
  };
}

describe('Section parsers', () => {
  it('parses personal section and generates fallback id', () => {
    const parser = new PersonalSectionParser();
    const parsedSection = parser.parse(
      {
        ...sectionBase('Home', 'Home'),
        info: {
          name: 'Simple Name',
          titles: ['Principal Engineer'],
          location: 'Austin, TX',
          phone: '+1 555 0189',
          email: 'simple@example.com',
          social: [{ linkedin: 'linkedin.com/in/simple-name' }],
        },
      },
      0,
    );

    expect(parsedSection.type).toBe('personal-section');
    expect(parsedSection.id).toBe('personal-section-1');
    expect(parsedSection.info.name).toBe('Simple Name');
  });

  it('parses value section', () => {
    const parser = new ValueSectionParser();
    const parsedSection = parser.parse(
      {
        ...sectionBase('About', 'About Me'),
        value: 'Product-minded software engineer with distributed systems experience.',
      },
      0,
    );

    expect(parsedSection.type).toBe('value-section');
    expect(parsedSection.value).toContain('software engineer');
  });

  it('parses label-values section', () => {
    const parser = new LabelValuesSectionParser();
    const parsedSection = parser.parse(
      {
        ...sectionBase('Skills', 'Skills'),
        labels: [{ label: 'Programming', values: ['TypeScript', 'Go'] }],
      },
      0,
    );

    expect(parsedSection.type).toBe('label-values-section');
    expect(parsedSection.labels[0]).toEqual({
      label: 'Programming',
      values: ['TypeScript', 'Go'],
    });
  });

  it('parses experience section', () => {
    const parser = new ExperienceSectionParser();
    const parsedSection = parser.parse(
      {
        ...sectionBase('Experience', 'Experience'),
        experiences: [
          {
            position: 'Principal Engineer',
            company: 'Northstar Labs',
            location: 'Austin, TX',
            country: 'USA',
            duration: {
              from: '2022',
              to: 'Present',
            },
            techs: [{ label: 'Cloud', values: ['AWS', 'Terraform'] }],
            highlights: ['Led platform modernization'],
          },
        ],
      },
      0,
    );

    expect(parsedSection.type).toBe('experience-section');
    expect(parsedSection.experiences).toHaveLength(1);
    expect(parsedSection.experiences[0]?.duration).toEqual({
      from: '2022',
      to: 'Present',
    });
  });

  it('parses education section', () => {
    const parser = new EducationSectionParser();
    const parsedSection = parser.parse(
      {
        ...sectionBase('Education', 'Education'),
        educations: [
          {
            institution: 'Northeastern University',
            degree: 'MS Software Engineering',
            field: 'Software Architecture',
            location: 'Boston, MA',
            country: 'USA',
            duration: {
              from: '2009',
              to: '2011',
            },
            courses: ['Distributed Systems'],
            highlights: ['Graduate Merit Scholarship'],
          },
        ],
      },
      0,
    );

    expect(parsedSection.type).toBe('education-section');
    expect(parsedSection.educations).toHaveLength(1);
    expect(parsedSection.educations[0]?.institution).toBe('Northeastern University');
  });

  it('parses projects section', () => {
    const parser = new ProjectsSectionParser();
    const parsedSection = parser.parse(
      {
        ...sectionBase('Projects', 'Projects'),
        projects: [
          {
            name: 'CV Processor',
            detail: 'Normalizes multilingual CV documents.',
            githubRepo: 'github.com/simple/cv-processor',
            techs: ['TypeScript', 'Node.js'],
          },
        ],
      },
      0,
    );

    expect(parsedSection.type).toBe('projects-section');
    expect(parsedSection.projects[0]?.techs).toEqual(['TypeScript', 'Node.js']);
  });

  it('parses certifications section', () => {
    const parser = new CertificationsSectionParser();
    const parsedSection = parser.parse(
      {
        ...sectionBase('Certifications', 'Certifications'),
        certifications: [
          {
            title: 'AWS Certified Solutions Architect',
            year: '2023',
            issuer: 'Amazon Web Services',
          },
        ],
      },
      0,
    );

    expect(parsedSection.type).toBe('certifications-section');
    expect(parsedSection.certifications[0]?.title).toBe(
      'AWS Certified Solutions Architect',
    );
  });

  it('parses interests section', () => {
    const parser = new InterestsSectionParser();
    const parsedSection = parser.parse(
      {
        ...sectionBase('Interests', 'Interests'),
        items: ['AI', 'Books'],
      },
      0,
    );

    expect(parsedSection.type).toBe('interests-section');
    expect(parsedSection.items).toEqual(['AI', 'Books']);
  });

  it('parses label-value2 section', () => {
    const parser = new LabelValue2SectionParser();
    const parsedSection = parser.parse(
      {
        ...sectionBase('Awards', 'Awards'),
        labels: [
          {
            label: 'Engineering Excellence Award',
            value1: 'Northstar Labs',
            value2: '2024',
          },
        ],
      },
      0,
    );

    expect(parsedSection.type).toBe('label-value2-section');
    expect(parsedSection.labels[0]).toEqual({
      label: 'Engineering Excellence Award',
      value1: 'Northstar Labs',
      value2: '2024',
    });
  });

  it('parses label-value1 section with value1 fallback', () => {
    const parser = new LabelValue1SectionParser();
    const parsedSection = parser.parse(
      {
        ...sectionBase('Additional', 'Additional'),
        labels: [
          {
            label: 'Availability',
            value1: '2 Weeks Notice',
          },
        ],
      },
      0,
    );

    expect(parsedSection.type).toBe('label-value1-section');
    expect(parsedSection.labels[0]).toEqual({
      label: 'Availability',
      value: '2 Weeks Notice',
    });
  });

  it('throws for invalid experience duration object', () => {
    const parser = new ExperienceSectionParser();

    expect(() =>
      parser.parse(
        {
          ...sectionBase('Experience', 'Experience'),
          experiences: [
            {
              position: 'Engineer',
              company: 'Acme',
              location: 'Austin',
              country: 'USA',
              duration: {
                from: '2022',
              },
              techs: [{ label: 'Programming', values: ['TypeScript'] }],
              highlights: ['Built scalable services'],
            },
          ],
        },
        0,
      ),
    ).toThrow(/duration\.to/);
  });
});
