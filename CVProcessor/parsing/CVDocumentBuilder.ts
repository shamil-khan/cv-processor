import type { CVDocument, CVSection } from "@/CVProcessor/domain";

export class CVDocumentBuilder {
  private readonly sections: CVSection[] = [];

  addSection(section: CVSection): this {
    this.sections.push(section);
    return this;
  }

  build(): CVDocument {
    return {
      sections: this.sections,
    };
  }
}
