import { parse } from "smol-toml";
import type { CVContentDeserializer } from "../CVContentDeserializer";

export class TomlContentDeserializer implements CVContentDeserializer {
  readonly format = "toml" as const;

  deserialize(content: string): unknown {
    try {
      return parse(content);
    } catch {
      throw new Error("toml parsing failed");
    }
  }
}
