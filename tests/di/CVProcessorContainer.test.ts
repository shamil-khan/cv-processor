import {
  createCVProcessorContainer,
  type CVDocumentContentParserFacade,
} from "@/CVProcessor";
import { describe, expect, it } from "vitest";
import { loadTextFixture } from "../helpers/fixtureLoader";

describe("createCVProcessorContainer", () => {
  it("registers singleton services and parses content end-to-end", () => {
    const container = createCVProcessorContainer();

    const facadeA = container.resolve<CVDocumentContentParserFacade>(
      "cvDocumentContentParserFacade",
    );
    const facadeB = container.resolve<CVDocumentContentParserFacade>(
      "cvDocumentContentParserFacade",
    );

    expect(facadeA).toBe(facadeB);

    const yamlContent = loadTextFixture("cv-data/cv-data.user.EN.yaml");
    const document = facadeA.parseByFilePath(yamlContent, "cv-data.user.EN.yaml");

    expect(document.sections[0]?.type).toBe("personal-section");
    expect(document.sections.length).toBeGreaterThan(1);
  });
});
