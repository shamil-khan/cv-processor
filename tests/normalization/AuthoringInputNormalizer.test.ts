import type {
  EducationSection,
  ExperienceSection,
  PersonalSection,
} from "@/CVProcessor/domain";
import {
  AuthoringInputNormalizer,
  AuthoringProfileRegistry,
} from "@/CVProcessor/normalization";
import { beforeEach, describe, expect, it } from "vitest";
import { loadJsonFixture } from "../helpers/fixtureLoader";
import { InMemoryLogger } from "../helpers/InMemoryLogger";

describe("AuthoringInputNormalizer", () => {
  let logger: InMemoryLogger;
  let normalizer: AuthoringInputNormalizer;

  beforeEach(() => {
    logger = new InMemoryLogger();
    normalizer = new AuthoringInputNormalizer(
      AuthoringProfileRegistry.createDefault(),
      logger,
    );
  });

  it("normalizes english authoring input into canonical sections", () => {
    const input = loadJsonFixture("cv-data/cv-data.user.EN.json");
    const document = normalizer.normalize(input);

    expect(document.sections.map((section) => section.type)).toEqual([
      "personal-section",
      "value-section",
      "label-values-section",
      "experience-section",
      "education-section",
      "label-value2-section",
      "label-value1-section",
      "projects-section",
      "certifications-section",
      "interests-section",
    ]);

    const personalSection = document.sections.find(
      (section): section is PersonalSection => section.type === "personal-section",
    );
    const experienceSection = document.sections.find(
      (section): section is ExperienceSection => section.type === "experience-section",
    );
    const educationSection = document.sections.find(
      (section): section is EducationSection => section.type === "education-section",
    );

    expect(personalSection?.info.name).toBe("Simple Name");
    expect(personalSection?.info.social).toHaveLength(4);
    expect(experienceSection?.experiences[0]?.duration).toEqual({
      from: "2022",
      to: "Present",
    });
    expect(educationSection?.educations[0]?.duration).toEqual({
      from: "2009",
      to: "2011",
    });
  });

  it("normalizes urdu authoring input into canonical sections", () => {
    const input = loadJsonFixture("cv-data/cv-data.user.UR.json");
    const document = normalizer.normalize(input);

    const personalSection = document.sections.find(
      (section): section is PersonalSection => section.type === "personal-section",
    );
    const experienceSection = document.sections.find(
      (section): section is ExperienceSection => section.type === "experience-section",
    );

    expect(personalSection?.info.name).toBe("سادہ نام");
    expect(personalSection?.info.social).toHaveLength(4);
    expect(experienceSection?.experiences[0]?.duration).toEqual({
      from: "2022",
      to: "تاحال",
    });
  });

  it("throws when personal name is missing", () => {
    expect(() => normalizer.normalize({ summary: "No name" })).toThrow(
      "name is required.",
    );
  });

  it("logs warnings for missing socials and incomplete duration fields", () => {
    const input = {
      name: "Warnings Example",
      experience: [
        {
          position: "Engineer",
          company: "Acme",
          highlights: ["Built internal tooling"],
        },
      ],
      education: [
        {
          institution: "State University",
          degree: "BS Computer Science",
          duration: {
            from: "2010",
          },
        },
      ],
    };

    normalizer.normalize(input);

    const warningMessages = logger.entries
      .filter((entry) => entry.level === "warn")
      .map((entry) => entry.message);

    expect(warningMessages).toContain(
      "no social links were provided in personal section",
    );
    expect(warningMessages).toContain("duration field is not provided");
    expect(warningMessages).toContain("duration object is missing expected from/to");
    expect(warningMessages).toContain("experience entry has missing important fields");
    expect(warningMessages).toContain("education entry has missing important fields");
  });
});
