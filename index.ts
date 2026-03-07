import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createCVProcessorContainer, CVDocumentContentParserFacade } from "@/CVProcessor";

function main(): void {
  const container = createCVProcessorContainer();
  const logger = container.resolve("rootLogger").child({ scope: "Main" });
  const args = process.argv.slice(2).filter((arg) => arg !== "--");
  const inputPath = args[0] ?? "./cv-data/cv-data.user.EN.yaml";
  const absolutePath = resolve(inputPath);

  logger.info("cv parsing started", { inputPath });

  try {
    const rawContent = readFileSync(absolutePath, "utf8");
    const contentParser = container.resolve<CVDocumentContentParserFacade>(
      "cvDocumentContentParserFacade",
    );
    const cvDocument = contentParser.parseByFilePath(rawContent, inputPath);

    logger.info("cv parsing completed", {
      inputPath,
      sections: cvDocument.sections.length,
    });

    logger.debug("cv document payload", { cvDocument });
  } catch (error) {
    logger.error("cv parsing failed", {
      inputPath,
      error: error instanceof Error ? error.message : "unknown error",
    });

    throw error;
  }
}

main();
