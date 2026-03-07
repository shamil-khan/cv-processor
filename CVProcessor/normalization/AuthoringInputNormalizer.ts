import type {
  CertificationEntry,
  CertificationsSection,
  CVDocument,
  CVSection,
  Duration,
  EducationEntry,
  EducationSection,
  ExperienceEntry,
  ExperienceSection,
  InterestsSection,
  LabelValue1,
  LabelValue1Section,
  LabelValue2,
  LabelValue2Section,
  LabelValues,
  LabelValuesSection,
  Personal,
  PersonalSection,
  ProjectEntry,
  ProjectsSection,
  SectionType,
  SocialEntry,
  ValueSection,
} from "@/CVProcessor/domain";
import type { UnknownRecord } from "@/CVProcessor/validation";
import type { AuthoringProfile } from "./AuthoringProfile";
import { AuthoringProfileRegistry } from "./AuthoringProfileRegistry";

export class AuthoringInputNormalizer {
  constructor(
    private readonly profileRegistry: AuthoringProfileRegistry = AuthoringProfileRegistry.createDefault(),
  ) {}

  normalize(input: unknown): CVDocument {
    const documentRecord = this.toRecord(input);
    const profile = this.profileRegistry.resolve(documentRecord);
    const personalSources = this.getPersonalSources(documentRecord, profile);
    const requiredName = this.readStringFromSources(
      personalSources,
      profile.aliases.name,
    );

    if (!requiredName) {
      throw new Error("name is required.");
    }

    const sectionTypeCount = new Map<SectionType, number>();
    const sections: CVSection[] = [];

    sections.push(
      this.buildPersonalSection(requiredName, personalSources, profile, sectionTypeCount),
    );

    const summarySection = this.buildSummarySection(
      documentRecord,
      profile,
      sectionTypeCount,
    );

    if (summarySection) {
      sections.push(summarySection);
    }

    const skillsSection = this.buildSkillsSection(
      documentRecord,
      profile,
      sectionTypeCount,
    );

    if (skillsSection) {
      sections.push(skillsSection);
    }

    const experienceSection = this.buildExperienceSection(
      documentRecord,
      profile,
      sectionTypeCount,
    );

    if (experienceSection) {
      sections.push(experienceSection);
    }

    const educationSection = this.buildEducationSection(
      documentRecord,
      profile,
      sectionTypeCount,
    );

    if (educationSection) {
      sections.push(educationSection);
    }

    const awardsSection = this.buildAwardsSection(
      documentRecord,
      profile,
      sectionTypeCount,
    );

    if (awardsSection) {
      sections.push(awardsSection);
    }

    const additionalSection = this.buildAdditionalSection(
      documentRecord,
      profile,
      sectionTypeCount,
    );

    if (additionalSection) {
      sections.push(additionalSection);
    }

    const projectsSection = this.buildProjectsSection(
      documentRecord,
      profile,
      sectionTypeCount,
    );

    if (projectsSection) {
      sections.push(projectsSection);
    }

    const certificationsSection = this.buildCertificationsSection(
      documentRecord,
      profile,
      sectionTypeCount,
    );

    if (certificationsSection) {
      sections.push(certificationsSection);
    }

    const interestsSection = this.buildInterestsSection(
      documentRecord,
      profile,
      sectionTypeCount,
    );

    if (interestsSection) {
      sections.push(interestsSection);
    }

    return { sections };
  }

  private buildPersonalSection(
    requiredName: string,
    personalSources: UnknownRecord[],
    profile: AuthoringProfile,
    sectionTypeCount: Map<SectionType, number>,
  ): PersonalSection {
    const location =
      this.readStringFromSources(personalSources, profile.aliases.location) ??
      this.readStringFromSources(personalSources, profile.aliases.country) ??
      "";

    const info: Personal = {
      name: requiredName,
      titles: this.readStringArrayFromSources(personalSources, profile.aliases.titles),
      location,
      phone: this.readStringFromSources(personalSources, profile.aliases.phone) ?? "",
      email: this.readStringFromSources(personalSources, profile.aliases.email) ?? "",
      photo: this.readStringFromSources(personalSources, profile.aliases.photo),
      social: this.parseSocialEntries(personalSources, profile),
    };

    const caption = profile.captions.personal;

    return {
      type: "personal-section",
      id: this.nextSectionId("personal-section", sectionTypeCount),
      name: caption.name,
      title: caption.title,
      info,
    };
  }

  private buildSummarySection(
    documentRecord: UnknownRecord,
    profile: AuthoringProfile,
    sectionTypeCount: Map<SectionType, number>,
  ): ValueSection | undefined {
    const summary = this.readSummaryValue(documentRecord, profile);

    if (!summary) {
      return undefined;
    }

    const caption = profile.captions.summary;

    return {
      type: "value-section",
      id: this.nextSectionId("value-section", sectionTypeCount),
      name: caption.name,
      title: caption.title,
      value: summary,
    };
  }

  private buildSkillsSection(
    documentRecord: UnknownRecord,
    profile: AuthoringProfile,
    sectionTypeCount: Map<SectionType, number>,
  ): LabelValuesSection | undefined {
    const skillRecords = this.readRecordArray(documentRecord, profile.aliases.skills);
    const labels: LabelValues[] = [];

    skillRecords.forEach((skillRecord) => {
      const label =
        this.readString(skillRecord, profile.aliases.category) ??
        this.readString(skillRecord, profile.aliases.label) ??
        "";
      const values = this.readStringArray(skillRecord, profile.aliases.items);

      if (label || values.length > 0) {
        labels.push({
          label,
          values,
        });
      }
    });

    if (labels.length === 0) {
      return undefined;
    }

    const caption = profile.captions.skills;

    return {
      type: "label-values-section",
      id: this.nextSectionId("label-values-section", sectionTypeCount),
      name: caption.name,
      title: caption.title,
      labels,
    };
  }

  private buildExperienceSection(
    documentRecord: UnknownRecord,
    profile: AuthoringProfile,
    sectionTypeCount: Map<SectionType, number>,
  ): ExperienceSection | undefined {
    const experienceRecords = this.readRecordArray(
      documentRecord,
      profile.aliases.experience,
    );
    const experiences: ExperienceEntry[] = [];

    experienceRecords.forEach((experienceRecord) => {
      const duration = this.parseDuration(experienceRecord, profile);
      const techs = this.parseTechLabels(experienceRecord, profile);
      const highlights = this.readStringArray(
        experienceRecord,
        profile.aliases.highlights,
      );

      const experience: ExperienceEntry = {
        position: this.readString(experienceRecord, profile.aliases.position) ?? "",
        company: this.readString(experienceRecord, profile.aliases.company) ?? "",
        location: this.readString(experienceRecord, profile.aliases.location) ?? "",
        country: this.readString(experienceRecord, profile.aliases.country) ?? "",
        duration,
        techs,
        highlights,
      };

      if (this.hasMeaningfulExperience(experience)) {
        experiences.push(experience);
      }
    });

    if (experiences.length === 0) {
      return undefined;
    }

    const caption = profile.captions.experience;

    return {
      type: "experience-section",
      id: this.nextSectionId("experience-section", sectionTypeCount),
      name: caption.name,
      title: caption.title,
      experiences,
    };
  }

  private buildEducationSection(
    documentRecord: UnknownRecord,
    profile: AuthoringProfile,
    sectionTypeCount: Map<SectionType, number>,
  ): EducationSection | undefined {
    const educationRecords = this.readRecordArray(
      documentRecord,
      profile.aliases.education,
    );
    const educations: EducationEntry[] = [];

    educationRecords.forEach((educationRecord) => {
      const duration = this.parseDuration(educationRecord, profile);
      const education: EducationEntry = {
        institution: this.readString(educationRecord, profile.aliases.institution) ?? "",
        degree: this.readString(educationRecord, profile.aliases.degree) ?? "",
        field: this.readString(educationRecord, profile.aliases.field) ?? "",
        location: this.readString(educationRecord, profile.aliases.location) ?? "",
        country: this.readString(educationRecord, profile.aliases.country) ?? "",
        duration,
        courses: this.readStringArray(educationRecord, profile.aliases.courses),
        highlights: this.readStringArray(educationRecord, profile.aliases.highlights),
      };

      if (this.hasMeaningfulEducation(education)) {
        educations.push(education);
      }
    });

    if (educations.length === 0) {
      return undefined;
    }

    const caption = profile.captions.education;

    return {
      type: "education-section",
      id: this.nextSectionId("education-section", sectionTypeCount),
      name: caption.name,
      title: caption.title,
      educations,
    };
  }

  private buildAwardsSection(
    documentRecord: UnknownRecord,
    profile: AuthoringProfile,
    sectionTypeCount: Map<SectionType, number>,
  ): LabelValue2Section | undefined {
    const awardRecords = this.readRecordArray(documentRecord, profile.aliases.awards);
    const labels: LabelValue2[] = [];

    awardRecords.forEach((awardRecord) => {
      const label: LabelValue2 = {
        label: this.readString(awardRecord, profile.aliases.title) ?? "",
        value1: this.readString(awardRecord, profile.aliases.issuer) ?? "",
        value2: this.readString(awardRecord, profile.aliases.year) ?? "",
      };

      if (label.label || label.value1 || label.value2) {
        labels.push(label);
      }
    });

    if (labels.length === 0) {
      return undefined;
    }

    const caption = profile.captions.awards;

    return {
      type: "label-value2-section",
      id: this.nextSectionId("label-value2-section", sectionTypeCount),
      name: caption.name,
      title: caption.title,
      labels,
    };
  }

  private buildAdditionalSection(
    documentRecord: UnknownRecord,
    profile: AuthoringProfile,
    sectionTypeCount: Map<SectionType, number>,
  ): LabelValue1Section | undefined {
    const additionalValue = this.readFirstValue(
      documentRecord,
      profile.aliases.additional,
    );
    const labels: LabelValue1[] = [];

    if (this.isRecord(additionalValue)) {
      for (const [label, value] of Object.entries(additionalValue)) {
        const resolvedValue = this.toDisplayString(value);

        if (resolvedValue) {
          labels.push({ label, value: resolvedValue });
        }
      }
    }

    if (Array.isArray(additionalValue)) {
      additionalValue
        .filter((entry): entry is UnknownRecord => this.isRecord(entry))
        .forEach((entry) => {
          const label =
            this.readString(entry, profile.aliases.label) ??
            this.readString(entry, profile.aliases.title) ??
            "";
          const value = this.readString(entry, profile.aliases.value) ?? "";

          if (label || value) {
            labels.push({ label, value });
          }
        });
    }

    if (labels.length === 0) {
      return undefined;
    }

    const caption = profile.captions.additional;

    return {
      type: "label-value1-section",
      id: this.nextSectionId("label-value1-section", sectionTypeCount),
      name: caption.name,
      title: caption.title,
      labels,
    };
  }

  private buildProjectsSection(
    documentRecord: UnknownRecord,
    profile: AuthoringProfile,
    sectionTypeCount: Map<SectionType, number>,
  ): ProjectsSection | undefined {
    const projectRecords = this.readRecordArray(documentRecord, profile.aliases.projects);
    const projects: ProjectEntry[] = [];

    projectRecords.forEach((projectRecord) => {
      const project: ProjectEntry = {
        name:
          this.readString(projectRecord, profile.aliases.name) ??
          this.readString(projectRecord, profile.aliases.label),
        title: this.readString(projectRecord, profile.aliases.title),
        logo:
          this.readString(projectRecord, profile.aliases.logo) ??
          this.readString(projectRecord, profile.aliases.photo),
        detail:
          this.readString(projectRecord, profile.aliases.detail) ??
          this.readString(projectRecord, profile.aliases.value),
        githubRepo:
          this.readString(projectRecord, profile.aliases.githubRepo) ??
          this.readString(projectRecord, profile.socialPlatforms.github),
        techs: this.readProjectTechs(projectRecord, profile),
        snapshot: this.readString(projectRecord, profile.aliases.snapshot),
      };

      if (this.hasMeaningfulProject(project)) {
        projects.push(project);
      }
    });

    if (projects.length === 0) {
      return undefined;
    }

    const caption = profile.captions.projects;

    return {
      type: "projects-section",
      id: this.nextSectionId("projects-section", sectionTypeCount),
      name: caption.name,
      title: caption.title,
      projects,
    };
  }

  private buildCertificationsSection(
    documentRecord: UnknownRecord,
    profile: AuthoringProfile,
    sectionTypeCount: Map<SectionType, number>,
  ): CertificationsSection | undefined {
    const certificationRecords = this.readRecordArray(
      documentRecord,
      profile.aliases.certifications,
    );
    const certifications: CertificationEntry[] = [];

    certificationRecords.forEach((certificationRecord) => {
      const certification: CertificationEntry = {
        title: this.readString(certificationRecord, profile.aliases.title),
        year: this.readString(certificationRecord, profile.aliases.year),
        logo:
          this.readString(certificationRecord, profile.aliases.logo) ??
          this.readString(certificationRecord, profile.aliases.photo),
        issuer: this.readString(certificationRecord, profile.aliases.issuer),
        onlineLink:
          this.readString(certificationRecord, profile.aliases.onlineLink) ??
          this.readString(certificationRecord, profile.socialPlatforms.website),
      };

      if (this.hasMeaningfulCertification(certification)) {
        certifications.push(certification);
      }
    });

    if (certifications.length === 0) {
      return undefined;
    }

    const caption = profile.captions.certifications;

    return {
      type: "certifications-section",
      id: this.nextSectionId("certifications-section", sectionTypeCount),
      name: caption.name,
      title: caption.title,
      certifications,
    };
  }

  private buildInterestsSection(
    documentRecord: UnknownRecord,
    profile: AuthoringProfile,
    sectionTypeCount: Map<SectionType, number>,
  ): InterestsSection | undefined {
    const items = this.readStringArray(documentRecord, profile.aliases.interests);

    if (items.length === 0) {
      return undefined;
    }

    const caption = profile.captions.interests;

    return {
      type: "interests-section",
      id: this.nextSectionId("interests-section", sectionTypeCount),
      name: caption.name,
      title: caption.title,
      items,
    };
  }

  private readSummaryValue(
    documentRecord: UnknownRecord,
    profile: AuthoringProfile,
  ): string | undefined {
    const summaryText = this.readString(documentRecord, profile.aliases.summary);

    if (summaryText) {
      return summaryText;
    }

    const summaryValue = this.readFirstValue(documentRecord, profile.aliases.summary);

    if (!Array.isArray(summaryValue)) {
      return undefined;
    }

    const paragraphs = summaryValue
      .map((entry) => this.toDisplayString(entry) ?? "")
      .map((entry) => entry.trim())
      .filter((entry) => entry.length > 0);

    return paragraphs.length > 0 ? paragraphs.join("\n\n") : undefined;
  }

  private parseTechLabels(
    experienceRecord: UnknownRecord,
    profile: AuthoringProfile,
  ): LabelValues[] {
    const techValue = this.readFirstValue(experienceRecord, profile.aliases.techs);

    if (!Array.isArray(techValue)) {
      return [];
    }

    const labels: LabelValues[] = [];

    const directValues = techValue
      .map((entry) => this.toDisplayString(entry) ?? "")
      .map((entry) => entry.trim())
      .filter((entry) => entry.length > 0);

    if (directValues.length > 0) {
      labels.push({
        label: "",
        values: directValues,
      });
    }

    techValue
      .filter((entry): entry is UnknownRecord => this.isRecord(entry))
      .forEach((entry) => {
        const label =
          this.readString(entry, profile.aliases.category) ??
          this.readString(entry, profile.aliases.label) ??
          "";
        const values = this.readStringArray(entry, profile.aliases.items);

        if (label || values.length > 0) {
          labels.push({ label, values });
        }
      });

    return labels;
  }

  private readProjectTechs(
    projectRecord: UnknownRecord,
    profile: AuthoringProfile,
  ): string[] {
    const directTechs = this.readStringArray(projectRecord, profile.aliases.techs);

    if (directTechs.length > 0) {
      return directTechs;
    }

    return this.readStringArray(projectRecord, profile.aliases.items);
  }

  private parseDuration(record: UnknownRecord, profile: AuthoringProfile): Duration {
    const durationValue = this.readFirstValue(record, profile.aliases.duration);

    if (this.isRecord(durationValue)) {
      return {
        from: this.readString(durationValue, profile.aliases.from) ?? "",
        to: this.readString(durationValue, profile.aliases.to) ?? "",
      };
    }

    if (typeof durationValue === "string") {
      const normalizedDuration = durationValue.trim();

      if (normalizedDuration.length === 0) {
        return { from: "", to: "" };
      }

      const parts = this.splitDuration(normalizedDuration, profile.durationDelimiters);

      if (parts.length >= 2) {
        return {
          from: parts[0],
          to: parts.slice(1).join(" - "),
        };
      }

      return {
        from: normalizedDuration,
        to: "",
      };
    }

    return {
      from: "",
      to: "",
    };
  }

  private splitDuration(duration: string, delimiters: readonly string[]): string[] {
    const escapedDelimiters = delimiters.map((delimiter) =>
      delimiter.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
    );
    const pattern = new RegExp(`\\s*(?:${escapedDelimiters.join("|")})\\s*`, "i");

    return duration
      .split(pattern)
      .map((entry) => entry.trim())
      .filter((entry) => entry.length > 0);
  }

  private parseSocialEntries(
    personalSources: UnknownRecord[],
    profile: AuthoringProfile,
  ): SocialEntry[] {
    const entries: SocialEntry[] = [];
    const seen = new Set<string>();
    const socialRecord = this.readRecordFromSources(
      personalSources,
      profile.aliases.social,
    );

    if (socialRecord) {
      for (const [platform, value] of Object.entries(socialRecord)) {
        const resolvedValue = this.toDisplayString(value);

        if (resolvedValue) {
          this.pushSocialEntry(entries, seen, platform, resolvedValue);
        }
      }
    }

    for (const [platform, aliases] of Object.entries(profile.socialPlatforms)) {
      const directValue = this.readStringFromSources(personalSources, aliases);

      if (directValue) {
        this.pushSocialEntry(entries, seen, platform, directValue);
      }
    }

    return entries;
  }

  private pushSocialEntry(
    entries: SocialEntry[],
    seen: Set<string>,
    platform: string,
    value: string,
  ): void {
    const signature = `${platform}:${value}`;

    if (seen.has(signature)) {
      return;
    }

    entries.push({ [platform]: value });
    seen.add(signature);
  }

  private hasMeaningfulExperience(experience: ExperienceEntry): boolean {
    return Boolean(
      experience.position ||
      experience.company ||
      experience.location ||
      experience.country ||
      experience.duration.from ||
      experience.duration.to ||
      experience.techs.length > 0 ||
      experience.highlights.length > 0,
    );
  }

  private hasMeaningfulEducation(education: EducationEntry): boolean {
    return Boolean(
      education.institution ||
      education.degree ||
      education.field ||
      education.location ||
      education.country ||
      education.duration.from ||
      education.duration.to ||
      education.courses.length > 0 ||
      education.highlights.length > 0,
    );
  }

  private hasMeaningfulProject(project: ProjectEntry): boolean {
    return Boolean(
      project.name ||
      project.title ||
      project.logo ||
      project.detail ||
      project.githubRepo ||
      project.snapshot ||
      project.techs.length > 0,
    );
  }

  private hasMeaningfulCertification(certification: CertificationEntry): boolean {
    return Boolean(
      certification.title ||
      certification.year ||
      certification.logo ||
      certification.issuer ||
      certification.onlineLink,
    );
  }

  private getPersonalSources(
    documentRecord: UnknownRecord,
    profile: AuthoringProfile,
  ): UnknownRecord[] {
    const personalContainer = this.readRecord(
      documentRecord,
      profile.aliases.personalContainer,
    );

    if (personalContainer) {
      return [personalContainer, documentRecord];
    }

    return [documentRecord];
  }

  private readStringFromSources(
    sources: UnknownRecord[],
    aliases: readonly string[],
  ): string | undefined {
    for (const source of sources) {
      const value = this.readString(source, aliases);

      if (value) {
        return value;
      }
    }

    return undefined;
  }

  private readStringArrayFromSources(
    sources: UnknownRecord[],
    aliases: readonly string[],
  ): string[] {
    for (const source of sources) {
      const values = this.readStringArray(source, aliases);

      if (values.length > 0) {
        return values;
      }
    }

    return [];
  }

  private readRecordFromSources(
    sources: UnknownRecord[],
    aliases: readonly string[],
  ): UnknownRecord | undefined {
    for (const source of sources) {
      const value = this.readRecord(source, aliases);

      if (value) {
        return value;
      }
    }

    return undefined;
  }

  private readString(
    record: UnknownRecord,
    aliases: readonly string[],
  ): string | undefined {
    const value = this.readFirstValue(record, aliases);
    const normalized = this.toDisplayString(value)?.trim();

    return normalized && normalized.length > 0 ? normalized : undefined;
  }

  private readStringArray(record: UnknownRecord, aliases: readonly string[]): string[] {
    const value = this.readFirstValue(record, aliases);

    if (Array.isArray(value)) {
      return value
        .map((entry) => this.toDisplayString(entry) ?? "")
        .map((entry) => entry.trim())
        .filter((entry) => entry.length > 0);
    }

    if (typeof value === "string" && value.trim().length > 0) {
      return [value.trim()];
    }

    return [];
  }

  private readRecord(
    record: UnknownRecord,
    aliases: readonly string[],
  ): UnknownRecord | undefined {
    const value = this.readFirstValue(record, aliases);

    return this.isRecord(value) ? value : undefined;
  }

  private readRecordArray(
    record: UnknownRecord,
    aliases: readonly string[],
  ): UnknownRecord[] {
    const value = this.readFirstValue(record, aliases);

    if (!Array.isArray(value)) {
      return [];
    }

    return value.filter((entry): entry is UnknownRecord => this.isRecord(entry));
  }

  private readFirstValue(record: UnknownRecord, aliases: readonly string[]): unknown {
    for (const alias of aliases) {
      const key = this.resolveAliasKey(record, alias);

      if (key) {
        return record[key];
      }
    }

    return undefined;
  }

  private resolveAliasKey(record: UnknownRecord, alias: string): string | undefined {
    if (Object.hasOwn(record, alias)) {
      return alias;
    }

    const loweredAlias = alias.toLowerCase();

    return Object.keys(record).find((key) => key.toLowerCase() === loweredAlias);
  }

  private nextSectionId(
    sectionType: SectionType,
    sectionTypeCount: Map<SectionType, number>,
  ): string {
    const nextCount = (sectionTypeCount.get(sectionType) ?? 0) + 1;
    sectionTypeCount.set(sectionType, nextCount);

    return `${sectionType}-${nextCount}`;
  }

  private toDisplayString(value: unknown): string | undefined {
    if (typeof value === "string") {
      return value;
    }

    if (typeof value === "number" || typeof value === "boolean") {
      return String(value);
    }

    return undefined;
  }

  private toRecord(input: unknown): UnknownRecord {
    if (!this.isRecord(input)) {
      throw new Error("input must be an object.");
    }

    return input;
  }

  private isRecord(value: unknown): value is UnknownRecord {
    return typeof value === "object" && value !== null && !Array.isArray(value);
  }
}
