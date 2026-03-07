import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { CVDocumentContentParserFacade } from "@/CVProcessor";

function main(): void {
  const args = process.argv.slice(2).filter((arg) => arg !== "--");
  const inputPath = args[0] ?? "./cv-data/cv-data.user.EN.yaml";
  const absolutePath = resolve(inputPath);
  const rawContent = readFileSync(absolutePath, "utf8");
  const contentParser = new CVDocumentContentParserFacade();
  const cvDocument = contentParser.parseByFilePath(rawContent, inputPath);

  console.log(
    `Loaded CV document with ${cvDocument.sections.length} sections from ${inputPath}.`,
  );
  console.dir(cvDocument, { depth: null });
}

main();
