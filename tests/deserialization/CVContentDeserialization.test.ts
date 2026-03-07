import {
  CVContentDeserializerFactory,
  CVContentFormatResolver,
  JsonContentDeserializer,
  TomlContentDeserializer,
  YamlContentDeserializer,
} from '@/CVProcessor/deserialization';
import { describe, expect, it } from 'vitest';
import { loadTextFixture } from '../helpers/fixtureLoader';

describe('CV content deserialization', () => {
  it('deserializes EN and UR content across JSON, YAML, and TOML', () => {
    const factory = new CVContentDeserializerFactory([
      new JsonContentDeserializer(),
      new YamlContentDeserializer(),
      new TomlContentDeserializer(),
    ]);

    const enJson = factory
      .getDeserializer('json')
      .deserialize(loadTextFixture('cv-data/cv-data.user.EN.json')) as Record<
      string,
      unknown
    >;
    const enYaml = factory
      .getDeserializer('yaml')
      .deserialize(loadTextFixture('cv-data/cv-data.user.EN.yaml')) as Record<
      string,
      unknown
    >;
    const enToml = factory
      .getDeserializer('toml')
      .deserialize(loadTextFixture('cv-data/cv-data.user.EN.toml')) as Record<
      string,
      unknown
    >;

    const urJson = factory
      .getDeserializer('json')
      .deserialize(loadTextFixture('cv-data/cv-data.user.UR.json')) as Record<
      string,
      unknown
    >;
    const urYaml = factory
      .getDeserializer('yaml')
      .deserialize(loadTextFixture('cv-data/cv-data.user.UR.yaml')) as Record<
      string,
      unknown
    >;
    const urToml = factory
      .getDeserializer('toml')
      .deserialize(loadTextFixture('cv-data/cv-data.user.UR.toml')) as Record<
      string,
      unknown
    >;

    expect(enJson.name).toBe('Simple Name');
    expect(enYaml.name).toBe('Simple Name');
    expect(enToml.name).toBe('Simple Name');

    expect(urJson['نام']).toBe('سادہ نام');
    expect(urYaml['نام']).toBe('سادہ نام');
    expect(urToml['نام']).toBe('سادہ نام');
  });

  it('wraps deserializer parser errors with stable messages', () => {
    const jsonDeserializer = new JsonContentDeserializer();
    const yamlDeserializer = new YamlContentDeserializer();
    const tomlDeserializer = new TomlContentDeserializer();

    expect(() => jsonDeserializer.deserialize('{ invalid json }')).toThrow(
      'json parsing failed',
    );
    expect(() => yamlDeserializer.deserialize('summary: [unclosed')).toThrow(
      'yaml parsing failed',
    );
    expect(() => tomlDeserializer.deserialize("name = 'a'\n=broken")).toThrow(
      'toml parsing failed',
    );
  });

  it('resolves content format by file path and content type', () => {
    expect(CVContentFormatResolver.resolveFromFilePath('cv-data.user.EN.json')).toBe(
      'json',
    );
    expect(CVContentFormatResolver.resolveFromFilePath('cv-data.user.EN.yml')).toBe(
      'yaml',
    );
    expect(CVContentFormatResolver.resolveFromFilePath('cv-data.user.EN.toml')).toBe(
      'toml',
    );
    expect(
      CVContentFormatResolver.resolveFromContentType('application/x-toml; charset=utf-8'),
    ).toBe('toml');

    expect(() => CVContentFormatResolver.resolveFromFilePath('cv-data.profile')).toThrow(
      'unsupported file extension: .profile',
    );
    expect(() => CVContentFormatResolver.resolveFromContentType('text/plain')).toThrow(
      'unsupported content type: text/plain',
    );
  });
});
