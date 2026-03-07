import type {
  CertificationEntry,
  Duration,
  EducationEntry,
  ExperienceEntry,
  LabelValue1,
  LabelValue2,
  LabelValues,
  Personal,
  ProjectEntry,
  SocialEntry,
} from '@/CVProcessor/domain';
import {
  JsonValueReader,
  ParseContext,
  type UnknownRecord,
} from '@/CVProcessor/validation';

export class SectionValueParser {
  static parseDuration(value: unknown, context: ParseContext): Duration {
    const durationRecord = JsonValueReader.readRecord(value, context);

    return {
      from: JsonValueReader.readString(durationRecord.from, context.field('from')),
      to: JsonValueReader.readString(durationRecord.to, context.field('to')),
    };
  }

  static parsePersonal(value: unknown, context: ParseContext): Personal {
    const personalRecord = JsonValueReader.readRecord(value, context);

    return {
      name: JsonValueReader.readString(personalRecord.name, context.field('name')),
      titles: JsonValueReader.readStringArray(
        personalRecord.titles,
        context.field('titles'),
      ),
      location: JsonValueReader.readString(
        personalRecord.location,
        context.field('location'),
      ),
      phone: JsonValueReader.readString(personalRecord.phone, context.field('phone')),
      email: JsonValueReader.readString(personalRecord.email, context.field('email')),
      photo: this.readOptionalString(personalRecord.photo),
      social: this.parseSocialEntries(personalRecord.social, context.field('social')),
    };
  }

  static parseLabelValues(value: unknown, context: ParseContext): LabelValues {
    const labelRecord = JsonValueReader.readRecord(value, context);

    return {
      label: JsonValueReader.readString(labelRecord.label, context.field('label')),
      values: JsonValueReader.readStringArray(
        labelRecord.values,
        context.field('values'),
      ),
    };
  }

  static parseLabelValue2(value: unknown, context: ParseContext): LabelValue2 {
    const labelRecord = JsonValueReader.readRecord(value, context);

    return {
      label: JsonValueReader.readString(labelRecord.label, context.field('label')),
      value1: JsonValueReader.readString(labelRecord.value1, context.field('value1')),
      value2: JsonValueReader.readString(labelRecord.value2, context.field('value2')),
    };
  }

  static parseLabelValue1(value: unknown, context: ParseContext): LabelValue1 {
    const labelRecord = JsonValueReader.readRecord(value, context);
    const resolvedValue =
      typeof labelRecord.value === 'string' ? labelRecord.value : labelRecord.value1;

    return {
      label: JsonValueReader.readString(labelRecord.label, context.field('label')),
      value: JsonValueReader.readString(resolvedValue, context.field('value')),
    };
  }

  static parseExperienceEntry(value: unknown, context: ParseContext): ExperienceEntry {
    const experienceRecord = JsonValueReader.readRecord(value, context);
    const techRecords = JsonValueReader.readRecordArray(
      experienceRecord.techs,
      context.field('techs'),
    );

    return {
      position: JsonValueReader.readString(
        experienceRecord.position,
        context.field('position'),
      ),
      company: JsonValueReader.readString(
        experienceRecord.company,
        context.field('company'),
      ),
      location: JsonValueReader.readString(
        experienceRecord.location,
        context.field('location'),
      ),
      country: JsonValueReader.readString(
        experienceRecord.country,
        context.field('country'),
      ),
      duration: this.parseDuration(experienceRecord.duration, context.field('duration')),
      techs: techRecords.map((tech, index) =>
        this.parseLabelValues(tech, context.field('techs').index(index)),
      ),
      highlights: JsonValueReader.readStringArray(
        experienceRecord.highlights,
        context.field('highlights'),
      ),
    };
  }

  static parseEducationEntry(value: unknown, context: ParseContext): EducationEntry {
    const educationRecord = JsonValueReader.readRecord(value, context);

    return {
      institution: JsonValueReader.readString(
        educationRecord.institution,
        context.field('institution'),
      ),
      degree: JsonValueReader.readString(educationRecord.degree, context.field('degree')),
      field: JsonValueReader.readString(educationRecord.field, context.field('field')),
      location: this.readOptionalString(educationRecord.location) ?? '',
      country: this.readOptionalString(educationRecord.country) ?? '',
      duration: this.parseDuration(educationRecord.duration, context.field('duration')),
      courses: JsonValueReader.readStringArray(
        educationRecord.courses,
        context.field('courses'),
      ),
      highlights: JsonValueReader.readStringArray(
        educationRecord.highlights,
        context.field('highlights'),
      ),
    };
  }

  static parseProjectEntry(value: unknown, context: ParseContext): ProjectEntry {
    const projectRecord = JsonValueReader.readRecord(value, context);

    return {
      name: this.readOptionalString(projectRecord.name),
      title: this.readOptionalString(projectRecord.title),
      logo: this.readOptionalString(projectRecord.logo),
      detail: this.readOptionalString(projectRecord.detail),
      githubRepo: this.readOptionalString(projectRecord.githubRepo),
      techs: Array.isArray(projectRecord.techs)
        ? JsonValueReader.readStringArray(projectRecord.techs, context.field('techs'))
        : [],
      snapshot: this.readOptionalString(projectRecord.snapshot),
    };
  }

  static parseCertificationEntry(
    value: unknown,
    context: ParseContext,
  ): CertificationEntry {
    const certificationRecord = JsonValueReader.readRecord(value, context);

    return {
      title: this.readOptionalString(certificationRecord.title),
      year: this.readOptionalString(certificationRecord.year),
      logo: this.readOptionalString(certificationRecord.logo),
      issuer: this.readOptionalString(certificationRecord.issuer),
      onlineLink: this.readOptionalString(certificationRecord.onlineLink),
    };
  }

  static parseLabelCollection(
    section: UnknownRecord,
    context: ParseContext,
  ): UnknownRecord[] {
    if (Array.isArray(section.labels)) {
      return JsonValueReader.readRecordArray(section.labels, context.field('labels'));
    }

    throw new Error(`${context} must include labels array.`);
  }

  private static parseSocialEntries(
    value: unknown,
    context: ParseContext,
  ): SocialEntry[] {
    const socialRecords = JsonValueReader.readRecordArray(value, context);

    return socialRecords.map((socialRecord, index) => {
      const socialEntry: SocialEntry = {};

      for (const [key, currentValue] of Object.entries(socialRecord)) {
        socialEntry[key] = JsonValueReader.readString(
          currentValue,
          context.index(index).field(key),
        );
      }

      if (Object.keys(socialEntry).length === 0) {
        throw new Error(`${context.index(index)} must include at least one field.`);
      }

      return socialEntry;
    });
  }

  private static readOptionalString(value: unknown): string | undefined {
    if (typeof value !== 'string') {
      return undefined;
    }

    const normalizedValue = value.trim();

    return normalizedValue.length > 0 ? normalizedValue : undefined;
  }
}
