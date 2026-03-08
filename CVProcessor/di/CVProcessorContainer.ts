import { asFunction, createContainer, type AwilixContainer } from 'awilix';
import {
  CVDocumentContentParserFacade,
  CVDocumentParserFacade,
} from '@/CVProcessor/application';
import {
  CVContentDeserializerFactory,
  JsonContentDeserializer,
  TomlContentDeserializer,
  YamlContentDeserializer,
} from '@/CVProcessor/deserialization';
import {
  type AppLogger,
  type LoggerDecorator,
  TestDecorator,
  NodeDecorator,
  WebDecorator,
  LoggerFactory,
} from '@/CVProcessor/logging';
import {
  AuthoringInputNormalizer,
  AuthoringProfileRegistry,
} from '@/CVProcessor/normalization';
import { CVDocumentParser, SectionParserFactory } from '@/CVProcessor/parsing';

export interface CVProcessorCradle {
  loggerDecorator: LoggerDecorator;
  loggerFactory: LoggerFactory;
  rootLogger: AppLogger;
  sectionParserFactory: SectionParserFactory;
  cvDocumentParser: CVDocumentParser;
  authoringProfileRegistry: AuthoringProfileRegistry;
  authoringInputNormalizer: AuthoringInputNormalizer;
  jsonContentDeserializer: JsonContentDeserializer;
  yamlContentDeserializer: YamlContentDeserializer;
  tomlContentDeserializer: TomlContentDeserializer;
  cvContentDeserializerFactory: CVContentDeserializerFactory;
  cvDocumentParserFacade: CVDocumentParserFacade;
  cvDocumentContentParserFacade: CVDocumentContentParserFacade;
}

export function createCVProcessorContainer(): AwilixContainer<CVProcessorCradle> {
  const container = createContainer<CVProcessorCradle>();

  container.register({
    loggerDecorator: asFunction(() => {
      const isNode = typeof process !== 'undefined' && !!process.versions?.node;
      const isProduction = process.env.NODE_ENV === 'production';
      const isTest = process.env.NODE_ENV === 'test';
      const decorator: LoggerDecorator = isTest
        ? new TestDecorator()
        : isNode && !isProduction
          ? new NodeDecorator()
          : new WebDecorator();
      return decorator;
    }).singleton(),
    loggerFactory: asFunction(
      ({ loggerDecorator }) => new LoggerFactory(loggerDecorator),
    ).singleton(),
    rootLogger: asFunction(({ loggerFactory }) => loggerFactory.getLogger('CVProcessor')),
    sectionParserFactory: asFunction(() =>
      SectionParserFactory.createDefault(),
    ).singleton(),
    cvDocumentParser: asFunction(({ sectionParserFactory, rootLogger }) => {
      return new CVDocumentParser(
        sectionParserFactory,
        rootLogger.child({ scope: 'CVDocumentParser' }),
      );
    }).singleton(),
    authoringProfileRegistry: asFunction(() => {
      return AuthoringProfileRegistry.createDefault();
    }).singleton(),
    authoringInputNormalizer: asFunction(({ authoringProfileRegistry, rootLogger }) => {
      return new AuthoringInputNormalizer(
        authoringProfileRegistry,
        rootLogger.child({ scope: 'AuthoringInputNormalizer' }),
      );
    }).singleton(),
    jsonContentDeserializer: asFunction(() => {
      return new JsonContentDeserializer();
    }).singleton(),
    yamlContentDeserializer: asFunction(() => {
      return new YamlContentDeserializer();
    }).singleton(),
    tomlContentDeserializer: asFunction(() => {
      return new TomlContentDeserializer();
    }).singleton(),
    cvContentDeserializerFactory: asFunction(
      ({ jsonContentDeserializer, yamlContentDeserializer, tomlContentDeserializer }) => {
        return new CVContentDeserializerFactory([
          jsonContentDeserializer,
          yamlContentDeserializer,
          tomlContentDeserializer,
        ]);
      },
    ).singleton(),
    cvDocumentParserFacade: asFunction(
      ({ cvDocumentParser, authoringInputNormalizer, rootLogger }) => {
        return new CVDocumentParserFacade(
          cvDocumentParser,
          authoringInputNormalizer,
          rootLogger.child({ scope: 'CVDocumentParserFacade' }),
        );
      },
    ).singleton(),
    cvDocumentContentParserFacade: asFunction(
      ({ cvContentDeserializerFactory, cvDocumentParserFacade, rootLogger }) => {
        return new CVDocumentContentParserFacade(
          cvContentDeserializerFactory,
          cvDocumentParserFacade,
          rootLogger.child({ scope: 'CVDocumentContentParserFacade' }),
        );
      },
    ).singleton(),
  });

  return container;
}
