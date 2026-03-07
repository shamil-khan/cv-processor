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
import { LoggerFactory, type AppLogger } from "@/CVProcessor/logging";
import type { UnknownRecord } from "@/CVProcessor/validation";
import type { AuthoringProfile } from "./AuthoringProfile";
import { AuthoringProfileRegistry } from "./AuthoringProfileRegistry";

export class AuthoringInputNormalizer {
  constructor(
    private readonly profileRegistry: AuthoringProfileRegistry = AuthoringProfileRegistry.createDefault(),
    private readonly logger: AppLogger = LoggerFactory.getLogger(
      "AuthoringInputNormalizer",
    ),
  ) {}

  normalize(input: unknown): CVDocument {
    const documentRecord = this.toRecord(input);
    const profile = this.profileRegistry.resolve(documentRecord);

    this.logger.info("authoring profile resolved", {
      profile: profile.id,
      direction: profile.direction,
    });

    const personalSources = this.getPersonalSources(documentRecord, profile);
    const requiredName = this.readStringFromSources(
      personalSources,
      profile.aliases.name,
    );

    if (!requiredName) {
      this.logger.error("personal name is missing");
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
      this.logSectionFound(summarySection.type);
    } else {
      this.logSectionMissing("value-section");
    }

    const skillsSection = this.buildSkillsSection(
      documentRecord,
      profile,
      sectionTypeCount,
    );

    if (skillsSection) {
      sections.push(skillsSection);
      this.logSectionFound(skillsSection.type, {
        labels: skillsSection.labels.length,
      });
    } else {
      this.logSectionMissing("label-values-section");
    }

    const experienceSection = this.buildExperienceSection(
      documentRecord,
      profile,
      sectionTypeCount,
    );

    if (experienceSection) {
      sections.push(experienceSection);
      this.logSectionFound(experienceSection.type, {
        experiences: experienceSection.experiences.length,
      });
    } else {
      this.logSectionMissing("experience-section");
    }

    const educationSection = this.buildEducationSection(
      documentRecord,
      profile,
      sectionTypeCount,
    );

    if (educationSection) {
      sections.push(educationSection);
      this.logSectionFound(educationSection.type, {
        educations: educationSection.educations.length,
      });
    } else {
      this.logSectionMissing("education-section");
    }

    const awardsSection = this.buildAwardsSection(
      documentRecord,
      profile,
      sectionTypeCount,
    );

    if (awardsSection) {
      sections.push(awardsSection);
      this.logSectionFound(awardsSection.type, {
        labels: awardsSection.labels.length,
      });
    } else {
      this.logSectionMissing("label-value2-section");
    }

    const additionalSection = this.buildAdditionalSection(
      documentRecord,
      profile,
      sectionTypeCount,
    );

    if (additionalSection) {
      sections.push(additionalSection);
      this.logSectionFound(additionalSection.type, {
        labels: additionalSection.labels.length,
      });
    } else {
      this.logSectionMissing("label-value1-section");
    }

    const projectsSection = this.buildProjectsSection(
      documentRecord,
      profile,
      sectionTypeCount,
    );

    if (projectsSection) {
      sections.push(projectsSection);
      this.logSectionFound(projectsSection.type, {
        projects: projectsSection.projects.length,
      });
    } else {
      this.logSectionMissing("projects-section");
    }

    const certificationsSection = this.buildCertificationsSection(
      documentRecord,
      profile,
      sectionTypeCount,
    );

    if (certificationsSection) {
      sections.push(certificationsSection);
      this.logSectionFound(certificationsSection.type, {
        certifications: certificationsSection.certifications.length,
      });
    } else {
      this.logSectionMissing("certifications-section");
    }

    const interestsSection = this.buildInterestsSection(
      documentRecord,
      profile,
      sectionTypeCount,
    );

    if (interestsSection) {
      sections.push(interestsSection);
      this.logSectionFound(interestsSection.type, {
        items: interestsSection.items.length,
      });
    } else {
      this.logSectionMissing("interests-section");
    }

    this.logger.info("authoring normalization completed", {
      sections: sections.length,
    });

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

    this.logger.debug("skills entries discovered", {
      entries: skillRecords.length,
    });

    const labels: LabelValues[] = [];

    skillRecords.forEach((skillRecord, skillIndex) => {
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
      } else {
        this.logger.warn("skills entry rejected due to missing label and values", {
          entryIndex: skillIndex,
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

    this.logger.debug("experience entries discovered", {
      entries: experienceRecords.length,
    });

    const experiences: ExperienceEntry[] = [];

    experienceRecords.forEach((experienceRecord, experienceIndex) => {
      const duration = this.parseDuration(
        experienceRecord,
        profile,
        `experience[${experienceIndex}]`,
      );
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

      this.logExperienceFieldGaps(experience, experienceIndex);

      if (this.hasMeaningfulExperience(experience)) {
        experiences.push(experience);
      } else {
        this.logger.warn("experience entry rejected due to insufficient data", {
          entryIndex: experienceIndex,
        });
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

    this.logger.debug("education entries discovered", {
      entries: educationRecords.length,
    });

    const educations: EducationEntry[] = [];

    educationRecords.forEach((educationRecord, educationIndex) => {
      const duration = this.parseDuration(
        educationRecord,
        profile,
        `education[${educationIndex}]`,
      );
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

      this.logEducationFieldGaps(education, educationIndex);

      if (this.hasMeaningfulEducation(education)) {
        educations.push(education);
      } else {
        this.logger.warn("education entry rejected due to insufficient data", {
          entryIndex: educationIndex,
        });
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

  private parseDuration(
    record: UnknownRecord,
    profile: AuthoringProfile,
    context: string,
  ): Duration {
    const durationValue = this.readFirstValue(record, profile.aliases.duration);

    if (durationValue === undefined) {
      this.logger.warn("duration field is not provided", {
        context,
        expected: ["from", "to"],
      });

      return {
        from: "",
        to: "",
      };
    }

    if (this.isRecord(durationValue)) {
      const from = this.readString(durationValue, profile.aliases.from) ?? "";
      const to = this.readString(durationValue, profile.aliases.to) ?? "";

      if (!from || !to) {
        this.logger.warn("duration object is missing expected from/to", {
          context,
          hasFrom: Boolean(from),
          hasTo: Boolean(to),
        });
      }

      return { from, to };
    }

    if (typeof durationValue === "string") {
      const normalizedDuration = durationValue.trim();

      if (normalizedDuration.length === 0) {
        this.logger.warn("duration string is empty", {
          context,
        });

        return { from: "", to: "" };
      }

      const parts = this.splitDuration(normalizedDuration, profile.durationDelimiters);

      if (parts.length >= 2) {
        return {
          from: parts[0],
          to: parts.slice(1).join(" - "),
        };
      }

      this.logger.warn("duration string did not split into from/to", {
        context,
        value: normalizedDuration,
      });

      return {
        from: normalizedDuration,
        to: "",
      };
    }

    this.logger.warn("duration has unsupported data type", {
      context,
      type: typeof durationValue,
    });

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

    if (entries.length === 0) {
      this.logger.warn("no social links were provided in personal section");
    } else {
      this.logger.info("social links parsed", {
        links: entries.length,
      });
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

  private logSectionFound(
    sectionType: SectionType,
    metadata?: Record<string, unknown>,
  ): void {
    this.logger.info("section parsed", {
      sectionType,
      ...(metadata ?? {}),
    });
  }

  private logSectionMissing(sectionType: SectionType): void {
    this.logger.debug("section not found", {
      sectionType,
    });
  }

  private logExperienceFieldGaps(experience: ExperienceEntry, entryIndex: number): void {
    const missingFields: string[] = [];

    if (!experience.position) {
      missingFields.push("position");
    }

    if (!experience.company) {
      missingFields.push("company");
    }

    if (!experience.duration.from) {
      missingFields.push("duration.from");
    }

    if (!experience.duration.to) {
      missingFields.push("duration.to");
    }

    if (experience.highlights.length === 0) {
      missingFields.push("highlights");
    }

    if (experience.techs.length === 0) {
      missingFields.push("techs");
    }

    if (missingFields.length > 0) {
      this.logger.warn("experience entry has missing important fields", {
        entryIndex,
        missingFields,
      });
      return;
    }

    this.logger.debug("experience entry parsed successfully", {
      entryIndex,
    });
  }

  private logEducationFieldGaps(education: EducationEntry, entryIndex: number): void {
    const missingFields: string[] = [];

    if (!education.institution) {
      missingFields.push("institution");
    }

    if (!education.degree) {
      missingFields.push("degree");
    }

    if (!education.duration.from) {
      missingFields.push("duration.from");
    }

    if (!education.duration.to) {
      missingFields.push("duration.to");
    }

    if (education.courses.length === 0) {
      missingFields.push("courses");
    }

    if (education.highlights.length === 0) {
      missingFields.push("highlights");
    }

    if (missingFields.length > 0) {
      this.logger.warn("education entry has missing important fields", {
        entryIndex,
        missingFields,
      });
      return;
    }

    this.logger.debug("education entry parsed successfully", {
      entryIndex,
    });
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
