import type { CVContentDeserializer } from "./CVContentDeserializer";
import type { CVContentFormat } from "./CVContentFormat";
import {
  JsonContentDeserializer,
  TomlContentDeserializer,
  YamlContentDeserializer,
} from "./deserializers";

export class CVContentDeserializerFactory {
  private readonly deserializerRegistry = new Map<
    CVContentFormat,
    CVContentDeserializer
  >();

  constructor(deserializers: CVContentDeserializer[]) {
    for (const deserializer of deserializers) {
      this.deserializerRegistry.set(deserializer.format, deserializer);
    }
  }

  static createDefault(): CVContentDeserializerFactory {
    return new CVContentDeserializerFactory([
      new JsonContentDeserializer(),
      new YamlContentDeserializer(),
      new TomlContentDeserializer(),
    ]);
  }

  getDeserializer(format: CVContentFormat): CVContentDeserializer {
    const deserializer = this.deserializerRegistry.get(format);

    if (!deserializer) {
      throw new Error(`unsupported content format: ${format}`);
    }

    return deserializer;
  }
}
