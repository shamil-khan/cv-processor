import type { ProjectsSection } from "@/CVProcessor/domain";
import {
  JsonValueReader,
  type ParseContext,
  type UnknownRecord,
} from "@/CVProcessor/validation";
import { BaseSectionParser, type SectionBase } from "../BaseSectionParser";
import { SectionValueParser } from "../SectionValueParser";

export class ProjectsSectionParser extends BaseSectionParser<
  "projects-section",
  ProjectsSection
> {
  readonly type = "projects-section";

  protected parseContent(
    section: UnknownRecord,
    _index: number,
    base: SectionBase<"projects-section">,
    sectionContext: ParseContext,
  ): ProjectsSection {
    const projectsContext = sectionContext.field("projects");
    const projects = JsonValueReader.readRecordArray(
      section.projects,
      projectsContext,
    ).map((project, projectIndex) =>
      SectionValueParser.parseProjectEntry(project, projectsContext.index(projectIndex)),
    );

    return {
      ...base,
      projects,
    };
  }
}
