import type {
  CVDocument,
  ISection,
  LabelValue1,
  LabelValue2,
  LabelValues,
} from "./cv-types.ts";
import rawCV from "./cv-data.ENG.json" with { type: "json" };

type UnknownRecord = Record<string, unknown>;
type MutableSection = ISection & UnknownRecord;

function toLabelValues(input: UnknownRecord): LabelValues {
  const label = typeof input.label === "string" ? input.label : "";
  const valuesSource = Array.isArray(input.values) ? input.values : [];
  const values = valuesSource.filter(
    (value): value is string => typeof value === "string",
  );
  return { label, values };
}

function toLabelValue2(input: UnknownRecord): LabelValue2 {
  return {
    label: typeof input.label === "string" ? input.label : "",
    value1: typeof input.value1 === "string" ? input.value1 : "",
    value2: typeof input.value2 === "string" ? input.value2 : "",
  };
}

function toLabelValue1(input: UnknownRecord): LabelValue1 {
  return {
    label: typeof input.label === "string" ? input.label : "",
    value: typeof input.value1 === "string" ? input.value1 : "",
  };
}

function normalizeSection(section: UnknownRecord, index: number): ISection {
  const type =
    typeof section.type === "string" && section.type.length > 0
      ? section.type
      : "section";
  const name = typeof section.name === "string" ? section.name : "";
  const title = typeof section.title === "string" ? section.title : name;

  const normalized: MutableSection = {
    ...section,
    type,
    name,
    title,
    id:
      typeof section.id === "string" && section.id.length > 0
        ? section.id
        : `${type}-${index + 1}`,
  };

  if (type === "experience-section" && Array.isArray(section.experiences)) {
    normalized.experiences = section.experiences.map((experience) => {
      if (!experience || typeof experience !== "object") {
        return experience;
      }

      const experienceRecord = experience as UnknownRecord;
      const techsSource = Array.isArray(experienceRecord.techs)
        ? experienceRecord.techs
        : [];

      const techs = techsSource
        .filter(
          (tech): tech is UnknownRecord => !!tech && typeof tech === "object",
        )
        .map(toLabelValues);

      return {
        ...experienceRecord,
        techs,
      };
    });
  }

  if (type === "label-value2-section") {
    const labelsSource = Array.isArray(section.labels)
      ? section.labels
      : Array.isArray(section.items)
        ? section.items
        : [];

    normalized.labels = labelsSource
      .filter(
        (item): item is UnknownRecord => !!item && typeof item === "object",
      )
      .map(toLabelValue2);
    delete normalized.items;
  }

  if (type === "label-value1-section") {
    const labelsSource = Array.isArray(section.labels)
      ? section.labels
      : Array.isArray(section.items)
        ? section.items
        : [];

    normalized.labels = labelsSource
      .filter(
        (item): item is UnknownRecord => !!item && typeof item === "object",
      )
      .map(toLabelValue1);
    delete normalized.items;
  }

  return normalized;
}

function toCVDocument(input: unknown): CVDocument {
  if (!input || typeof input !== "object") {
    throw new Error("CV payload must be an object.");
  }

  const data = input as { sections?: unknown };

  if (!Array.isArray(data.sections)) {
    throw new Error("CV payload must include a sections array.");
  }

  const sections = data.sections
    .filter(
      (section): section is UnknownRecord =>
        !!section && typeof section === "object",
    )
    .map(normalizeSection);

  return { sections };
}

function main(): void {
  const cvDocument = toCVDocument(rawCV);
  console.log(
    `Loaded CV document with ${cvDocument.sections.length} sections.`,
  );
  console.dir(cvDocument, { depth: null });
}

main();
