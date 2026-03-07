import type { UnknownRecord } from '@/CVProcessor/validation';
import type { AuthoringProfile } from './AuthoringProfile';
import { englishProfile, urduProfile } from './profiles';

const LOCALE_ALIASES = ['locale', 'language', 'lang', 'لوکیل', 'زبان'];
const META_ALIASES = ['meta', 'metadata', 'میٹا'];

export class AuthoringProfileRegistry {
  constructor(
    private readonly profiles: AuthoringProfile[],
    private readonly fallbackProfileId = 'en',
  ) {}

  static createDefault(): AuthoringProfileRegistry {
    return new AuthoringProfileRegistry([englishProfile, urduProfile]);
  }

  resolve(documentRecord: UnknownRecord): AuthoringProfile {
    const localeProfile = this.resolveByLocale(documentRecord);

    if (localeProfile) {
      return localeProfile;
    }

    const scoredProfiles = this.profiles
      .map((profile) => ({
        profile,
        score: this.calculateProfileScore(documentRecord, profile),
      }))
      .sort((left, right) => right.score - left.score);

    return scoredProfiles[0]?.score > 0
      ? scoredProfiles[0].profile
      : this.getFallbackProfile();
  }

  private resolveByLocale(documentRecord: UnknownRecord): AuthoringProfile | undefined {
    const directLocale = this.readFirstString(documentRecord, LOCALE_ALIASES);

    if (directLocale) {
      return this.findProfileByLocale(directLocale);
    }

    const metaRecord = this.readFirstRecord(documentRecord, META_ALIASES);

    if (!metaRecord) {
      return undefined;
    }

    const metaLocale = this.readFirstString(metaRecord, LOCALE_ALIASES);

    return metaLocale ? this.findProfileByLocale(metaLocale) : undefined;
  }

  private findProfileByLocale(localeValue: string): AuthoringProfile | undefined {
    const normalizedLocale = localeValue.trim().toLowerCase();

    if (normalizedLocale.length === 0) {
      return undefined;
    }

    return this.profiles.find(
      (profile) =>
        normalizedLocale === profile.id || normalizedLocale.startsWith(`${profile.id}-`),
    );
  }

  private calculateProfileScore(
    documentRecord: UnknownRecord,
    profile: AuthoringProfile,
  ): number {
    const keys = Object.keys(documentRecord);

    return profile.detectionKeys.reduce((score, key) => {
      return keys.includes(key) ? score + 1 : score;
    }, 0);
  }

  private getFallbackProfile(): AuthoringProfile {
    return (
      this.profiles.find((profile) => profile.id === this.fallbackProfileId) ??
      this.profiles[0]
    );
  }

  private readFirstString(
    record: UnknownRecord,
    aliases: readonly string[],
  ): string | undefined {
    const value = this.readFirstValue(record, aliases);

    return typeof value === 'string' ? value : undefined;
  }

  private readFirstRecord(
    record: UnknownRecord,
    aliases: readonly string[],
  ): UnknownRecord | undefined {
    const value = this.readFirstValue(record, aliases);

    return this.isRecord(value) ? value : undefined;
  }

  private readFirstValue(record: UnknownRecord, aliases: readonly string[]): unknown {
    for (const alias of aliases) {
      const resolvedKey = this.resolveKey(record, alias);

      if (resolvedKey) {
        return record[resolvedKey];
      }
    }

    return undefined;
  }

  private resolveKey(record: UnknownRecord, alias: string): string | undefined {
    if (Object.hasOwn(record, alias)) {
      return alias;
    }

    const loweredAlias = alias.toLowerCase();

    return Object.keys(record).find((key) => key.toLowerCase() === loweredAlias);
  }

  private isRecord(value: unknown): value is UnknownRecord {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  }
}
