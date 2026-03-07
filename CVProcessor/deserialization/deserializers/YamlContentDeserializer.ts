import { parse } from "yaml";
import type { CVContentDeserializer } from "../CVContentDeserializer";

export class YamlContentDeserializer implements CVContentDeserializer {
  readonly format = "yaml" as const;

  deserialize(content: string): unknown {
    try {
      return parse(content);
    } catch {
      throw new Error("yaml parsing failed");
    }
  }
}
