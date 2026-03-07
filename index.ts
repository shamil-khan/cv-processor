import { CVDocumentParserFacade } from "@/CVProcessor";
import rawCV from "./cv-data.user.EN.json" with { type: "json" };

function main(): void {
  const cvDocument = CVDocumentParserFacade.parse(rawCV);

  console.log(`Loaded CV document with ${cvDocument.sections.length} sections.`);
  console.dir(cvDocument, { depth: null });
}

main();
