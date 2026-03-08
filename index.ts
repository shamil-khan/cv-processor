import { readFileSync } from 'node:fs';
import { resolve, extname } from 'node:path';
import { BackendSample } from './samples/BackendSample';
import { WebSample } from './samples/WebSample';
import { DevSample } from './samples/DevSample';
import { type CVContentFormat } from './CVProcessor';

function getFormatFromExtension(ext: string): CVContentFormat {
  if (ext === '.json') return 'json';
  if (ext === '.toml') return 'toml';
  if (ext === '.yaml' || ext === '.yml') return 'yaml';
  return 'json';
}

function loadContentFromFile(filePath: string): {
  content: string;
  format: CVContentFormat;
} {
  const absolutePath = resolve(filePath);
  const content = readFileSync(absolutePath, 'utf8');
  const ext = extname(absolutePath).toLowerCase();

  return {
    content,
    format: getFormatFromExtension(ext),
  };
}

async function main(): Promise<void> {
  const args = process.argv.slice(2).filter((arg) => arg !== '--');
  const inputPath = args[0] ?? './cv-data/cv-data.user.EN.yaml';

  console.log(`\n--- Loading CV Content from ${inputPath} ---`);
  const { content, format } = loadContentFromFile(inputPath);

  console.log(`\n--- 1. Backend Sample ---`);
  try {
    const backend = new BackendSample();
    const docBackend = backend.process(content, format);
    console.log(
      `Backend processing successful. Found ${docBackend.sections.length} sections.`,
    );
  } catch (err: unknown) {
    console.error('BackendSample failed:', err instanceof Error ? err.message : err);
  }

  console.log(`\n--- 2. Web (REST) Sample ---`);
  try {
    // Mock global fetch for this demonstration script
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async () =>
      ({
        ok: true,
        text: async () => content,
      }) as Response;

    const web = new WebSample();
    // In web mode, we might get content that does not match the format (e.g. format=json, but content is yaml)
    // The library throws an error during deserialization in such cases.
    const docWeb = await web.loadAndParse(`https://example.com/api/cv.json`, format);
    console.log(`Web parsing successful. Found ${docWeb.sections.length} sections.`);

    // Restore fetch
    globalThis.fetch = originalFetch;
  } catch (err: unknown) {
    console.error('WebSample failed:', err instanceof Error ? err.message : err);
  }

  console.log(`\n--- 3. Dev Sample ---`);
  try {
    DevSample.run(inputPath);
  } catch (err: unknown) {
    console.error('DevSample failed:', err instanceof Error ? err.message : err);
  }
}

main().catch((err) => {
  console.error('Unhandled Rejection:', err);
});
