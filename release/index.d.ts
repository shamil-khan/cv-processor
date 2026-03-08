import { AwilixContainer } from 'awilix';
import pino, { LoggerOptions, DestinationStream, Logger } from 'pino';

interface SocialEntry {
    [key: string]: string;
}
interface Duration {
    from: string;
    to: string;
}

interface Personal {
    name: string;
    titles: string[];
    location: string;
    phone: string;
    email: string;
    photo?: string;
    social: SocialEntry[];
}
interface LabelValues {
    label: string;
    values: string[];
}
interface LabelValue2 {
    label: string;
    value1: string;
    value2: string;
}
interface LabelValue1 {
    label: string;
    value: string;
}
interface EducationEntry {
    institution: string;
    degree: string;
    field: string;
    location: string;
    country: string;
    duration: Duration;
    courses: string[];
    highlights: string[];
}
interface ExperienceEntry {
    position: string;
    company: string;
    location: string;
    country: string;
    duration: Duration;
    techs: LabelValues[];
    highlights: string[];
}
interface ProjectEntry {
    name?: string;
    title?: string;
    logo?: string;
    detail?: string;
    githubRepo?: string;
    techs: string[];
    snapshot?: string;
}
interface CertificationEntry {
    title?: string;
    year?: string;
    logo?: string;
    issuer?: string;
    onlineLink?: string;
}

type SectionType = 'personal-section' | 'experience-section' | 'education-section' | 'projects-section' | 'certifications-section' | 'interests-section' | 'value-section' | 'label-value1-section' | 'label-value2-section' | 'label-values-section';
interface ISection {
    type: SectionType;
    id: string;
    name: string;
    title: string;
}
interface PersonalSection extends ISection {
    type: 'personal-section';
    info: Personal;
}
interface ValueSection extends ISection {
    type: 'value-section';
    value: string;
}
interface LabelValuesSection extends ISection {
    type: 'label-values-section';
    labels: LabelValues[];
}
interface ExperienceSection extends ISection {
    type: 'experience-section';
    experiences: ExperienceEntry[];
}
interface EducationSection extends ISection {
    type: 'education-section';
    educations: EducationEntry[];
}
type EductionSection = EducationSection;
interface ProjectsSection extends ISection {
    type: 'projects-section';
    projects: ProjectEntry[];
}
interface CertificationsSection extends ISection {
    type: 'certifications-section';
    certifications: CertificationEntry[];
}
interface InterestsSection extends ISection {
    type: 'interests-section';
    items: string[];
}
interface LabelValue2Section extends ISection {
    type: 'label-value2-section';
    labels: LabelValue2[];
}
interface LabelValue1Section extends ISection {
    type: 'label-value1-section';
    labels: LabelValue1[];
}
type CVSection = PersonalSection | ExperienceSection | EducationSection | ProjectsSection | CertificationsSection | InterestsSection | ValueSection | LabelValue1Section | LabelValue2Section | LabelValuesSection;

interface CVDocument {
    sections: CVSection[];
}

type LoggerMetadata = Record<string, unknown>;
interface AppLogger {
    debug(message: string, metadata?: LoggerMetadata): void;
    info(message: string, metadata?: LoggerMetadata): void;
    warn(message: string, metadata?: LoggerMetadata): void;
    error(message: string, metadata?: LoggerMetadata): void;
    child(bindings: LoggerMetadata): AppLogger;
}

interface LoggerDecorator {
    decorate(options: LoggerOptions): {
        options: LoggerOptions;
        transport: DestinationStream | null;
    };
}
declare class TestDecorator implements LoggerDecorator {
    decorate: (options: LoggerOptions) => {
        options: {
            level: string;
            transport?: pino.TransportSingleOptions | pino.TransportMultiOptions | pino.TransportPipelineOptions;
            safe?: boolean;
            name?: string;
            serializers?: {
                [key: string]: pino.SerializerFn;
            };
            timestamp?: pino.TimeFn | boolean;
            customLevels?: {} | undefined;
            useOnlyCustomLevels?: boolean | undefined;
            levelComparison?: "ASC" | "DESC" | ((current: number, expected: number) => boolean);
            mixin?: pino.MixinFn<never> | undefined;
            mixinMergeStrategy?: pino.MixinMergeStrategyFn;
            redact?: string[] | pino.redactOptions;
            levelVal?: number;
            messageKey?: string;
            errorKey?: string;
            nestedKey?: string;
            enabled?: boolean;
            browser?: {
                asObject?: boolean;
                asObjectBindingsOnly?: boolean;
                formatters?: {
                    level?: (label: string, number: number) => object;
                    log?: (object: Record<string, unknown>) => Record<string, unknown>;
                };
                write?: pino.WriteFn | ({
                    fatal?: pino.WriteFn;
                    error?: pino.WriteFn;
                    warn?: pino.WriteFn;
                    info?: pino.WriteFn;
                    debug?: pino.WriteFn;
                    trace?: pino.WriteFn;
                } & {
                    [logLevel: string]: pino.WriteFn;
                });
                serialize?: boolean | string[];
                transmit?: {
                    level?: pino.LevelOrString;
                    send: (level: pino.Level, logEvent: pino.LogEvent) => void;
                };
                disabled?: boolean;
            };
            base?: {
                [key: string]: any;
            } | null;
            formatters?: {
                level?: (label: string, number: number) => object;
                bindings?: (bindings: pino.Bindings) => object;
                log?: (object: Record<string, unknown>) => Record<string, unknown>;
            };
            msgPrefix?: string;
            hooks?: {
                logMethod?: (this: pino.Logger, args: Parameters<pino.LogFn>, method: pino.LogFn, level: number) => void;
                streamWrite?: (s: string) => string;
            };
            depthLimit?: number;
            edgeLimit?: number;
            onChild?: pino.OnChildCallback<never> | undefined;
            crlf?: boolean;
        };
        transport: null;
    };
}
declare class WebDecorator implements LoggerDecorator {
    decorate: (options: LoggerOptions) => {
        options: {
            browser: {
                asObject: boolean;
                write: (o: unknown) => void;
            };
            transport?: pino.TransportSingleOptions | pino.TransportMultiOptions | pino.TransportPipelineOptions;
            safe?: boolean;
            name?: string;
            serializers?: {
                [key: string]: pino.SerializerFn;
            };
            timestamp?: pino.TimeFn | boolean;
            level?: pino.LevelWithSilentOrString;
            customLevels?: {} | undefined;
            useOnlyCustomLevels?: boolean | undefined;
            levelComparison?: "ASC" | "DESC" | ((current: number, expected: number) => boolean);
            mixin?: pino.MixinFn<never> | undefined;
            mixinMergeStrategy?: pino.MixinMergeStrategyFn;
            redact?: string[] | pino.redactOptions;
            levelVal?: number;
            messageKey?: string;
            errorKey?: string;
            nestedKey?: string;
            enabled?: boolean;
            base?: {
                [key: string]: any;
            } | null;
            formatters?: {
                level?: (label: string, number: number) => object;
                bindings?: (bindings: pino.Bindings) => object;
                log?: (object: Record<string, unknown>) => Record<string, unknown>;
            };
            msgPrefix?: string;
            hooks?: {
                logMethod?: (this: pino.Logger, args: Parameters<pino.LogFn>, method: pino.LogFn, level: number) => void;
                streamWrite?: (s: string) => string;
            };
            depthLimit?: number;
            edgeLimit?: number;
            onChild?: pino.OnChildCallback<never> | undefined;
            crlf?: boolean;
        };
        transport: null;
    };
}
declare class NodeDecorator implements LoggerDecorator {
    decorate: (options: LoggerOptions) => {
        options: pino.LoggerOptions<never, boolean>;
        transport: any;
    };
    private resolvePrettyTransport;
    private resolveLogFileTransport;
}

declare class LoggerFactory {
    private readonly decorator;
    private rootLogger;
    constructor(decorator: LoggerDecorator);
    getLogger(scope: string): AppLogger;
    private getRootLogger;
    private createRootLogger;
}

declare class PinoLoggerAdapter implements AppLogger {
    private readonly logger;
    constructor(logger: Logger);
    debug(message: string, metadata?: LoggerMetadata): void;
    info(message: string, metadata?: LoggerMetadata): void;
    warn(message: string, metadata?: LoggerMetadata): void;
    error(message: string, metadata?: LoggerMetadata): void;
    child(bindings: LoggerMetadata): AppLogger;
    private log;
}

type TextDirection = 'ltr' | 'rtl';
interface SectionCaption {
    name: string;
    title: string;
}
interface AuthoringProfile {
    id: string;
    direction: TextDirection;
    detectionKeys: readonly string[];
    aliases: {
        locale: readonly string[];
        meta: readonly string[];
        personalContainer: readonly string[];
        name: readonly string[];
        titles: readonly string[];
        location: readonly string[];
        country: readonly string[];
        phone: readonly string[];
        email: readonly string[];
        photo: readonly string[];
        social: readonly string[];
        summary: readonly string[];
        skills: readonly string[];
        experience: readonly string[];
        education: readonly string[];
        awards: readonly string[];
        additional: readonly string[];
        projects: readonly string[];
        certifications: readonly string[];
        interests: readonly string[];
        category: readonly string[];
        items: readonly string[];
        company: readonly string[];
        position: readonly string[];
        duration: readonly string[];
        highlights: readonly string[];
        techs: readonly string[];
        institution: readonly string[];
        degree: readonly string[];
        field: readonly string[];
        courses: readonly string[];
        title: readonly string[];
        issuer: readonly string[];
        year: readonly string[];
        detail: readonly string[];
        logo: readonly string[];
        githubRepo: readonly string[];
        snapshot: readonly string[];
        onlineLink: readonly string[];
        label: readonly string[];
        value: readonly string[];
        from: readonly string[];
        to: readonly string[];
    };
    socialPlatforms: Record<string, readonly string[]>;
    captions: {
        personal: SectionCaption;
        summary: SectionCaption;
        skills: SectionCaption;
        experience: SectionCaption;
        education: SectionCaption;
        awards: SectionCaption;
        additional: SectionCaption;
        projects: SectionCaption;
        certifications: SectionCaption;
        interests: SectionCaption;
    };
    durationDelimiters: readonly string[];
}

declare class ParseContext {
    private readonly path;
    private constructor();
    static root(): ParseContext;
    field(name: string): ParseContext;
    index(position: number): ParseContext;
    toString(): string;
}

declare const SECTION_TYPES: readonly SectionType[];
declare const SINGLE_INSTANCE_SECTION_TYPES: readonly SectionType[];
declare class ValidationRules {
    static isNonEmptyString(value: unknown): value is string;
    static isSectionType(value: unknown): value is SectionType;
    static isSingleInstanceSectionType(value: SectionType): boolean;
}

type UnknownRecord = Record<string, unknown>;
declare class JsonValueReader {
    static readRecord(value: unknown, context: ParseContext): UnknownRecord;
    static readRecordArray(value: unknown, context: ParseContext): UnknownRecord[];
    static readString(value: unknown, context: ParseContext): string;
    static readStringArray(value: unknown, context: ParseContext): string[];
    static readSectionType(value: unknown, context: ParseContext): SectionType;
    private static isRecord;
}

declare class AuthoringProfileRegistry {
    private readonly profiles;
    private readonly fallbackProfileId;
    constructor(profiles: AuthoringProfile[], fallbackProfileId?: string);
    static createDefault(): AuthoringProfileRegistry;
    resolve(documentRecord: UnknownRecord): AuthoringProfile;
    private resolveByLocale;
    private findProfileByLocale;
    private calculateProfileScore;
    private getFallbackProfile;
    private readFirstString;
    private readFirstRecord;
    private readFirstValue;
    private resolveKey;
    private isRecord;
}

declare class AuthoringInputNormalizer {
    private readonly profileRegistry;
    private readonly logger;
    constructor(profileRegistry: AuthoringProfileRegistry, logger: AppLogger);
    normalize(input: unknown): CVDocument;
    private buildPersonalSection;
    private buildSummarySection;
    private buildSkillsSection;
    private buildExperienceSection;
    private buildEducationSection;
    private buildAwardsSection;
    private buildAdditionalSection;
    private buildProjectsSection;
    private buildCertificationsSection;
    private buildInterestsSection;
    private readSummaryValue;
    private parseTechLabels;
    private readProjectTechs;
    private parseDuration;
    private splitDuration;
    private parseSocialEntries;
    private pushSocialEntry;
    private hasMeaningfulExperience;
    private hasMeaningfulEducation;
    private hasMeaningfulProject;
    private hasMeaningfulCertification;
    private logSectionFound;
    private logSectionMissing;
    private logExperienceFieldGaps;
    private logEducationFieldGaps;
    private getPersonalSources;
    private readStringFromSources;
    private readStringArrayFromSources;
    private readRecordFromSources;
    private readString;
    private readStringArray;
    private readRecord;
    private readRecordArray;
    private readFirstValue;
    private resolveAliasKey;
    private nextSectionId;
    private toDisplayString;
    private toRecord;
    private isRecord;
}

declare const englishProfile: AuthoringProfile;

declare const urduProfile: AuthoringProfile;

interface SectionParser<TSection extends CVSection = CVSection> {
    readonly type: SectionType;
    parse(section: UnknownRecord, index: number): TSection;
}

type SectionBase<TType extends SectionType> = {
    type: TType;
    id: string;
    name: string;
    title: string;
};
declare abstract class BaseSectionParser<TType extends SectionType, TSection extends CVSection & {
    type: TType;
}> implements SectionParser<TSection> {
    abstract readonly type: TType;
    parse(section: UnknownRecord, index: number): TSection;
    private createSectionContext;
    private parseSectionBase;
    protected abstract parseContent(section: UnknownRecord, index: number, base: SectionBase<TType>, sectionContext: ParseContext): TSection;
}

declare class SectionValueParser {
    static parseDuration(value: unknown, context: ParseContext): Duration;
    static parsePersonal(value: unknown, context: ParseContext): Personal;
    static parseLabelValues(value: unknown, context: ParseContext): LabelValues;
    static parseLabelValue2(value: unknown, context: ParseContext): LabelValue2;
    static parseLabelValue1(value: unknown, context: ParseContext): LabelValue1;
    static parseExperienceEntry(value: unknown, context: ParseContext): ExperienceEntry;
    static parseEducationEntry(value: unknown, context: ParseContext): EducationEntry;
    static parseProjectEntry(value: unknown, context: ParseContext): ProjectEntry;
    static parseCertificationEntry(value: unknown, context: ParseContext): CertificationEntry;
    static parseLabelCollection(section: UnknownRecord, context: ParseContext): UnknownRecord[];
    private static parseSocialEntries;
    private static readOptionalString;
}

declare class CVDocumentBuilder {
    private readonly sections;
    addSection(section: CVSection): this;
    build(): CVDocument;
}

declare class SectionParserFactory {
    private readonly parserRegistry;
    constructor(parsers: SectionParser[]);
    static createDefault(): SectionParserFactory;
    getParser(sectionType: SectionType): SectionParser;
}

declare class CVDocumentParser {
    private readonly parserFactory;
    private readonly logger;
    constructor(parserFactory: SectionParserFactory, logger: AppLogger);
    parse(input: unknown): CVDocument;
    private validateSingleInstanceSectionType;
    private extractErrorMessage;
}

declare class PersonalSectionParser extends BaseSectionParser<'personal-section', PersonalSection> {
    readonly type = "personal-section";
    protected parseContent(section: UnknownRecord, _index: number, base: SectionBase<'personal-section'>, sectionContext: ParseContext): PersonalSection;
}

declare class ValueSectionParser extends BaseSectionParser<'value-section', ValueSection> {
    readonly type = "value-section";
    protected parseContent(section: UnknownRecord, _index: number, base: SectionBase<'value-section'>, sectionContext: ParseContext): ValueSection;
}

declare class LabelValuesSectionParser extends BaseSectionParser<'label-values-section', LabelValuesSection> {
    readonly type = "label-values-section";
    protected parseContent(section: UnknownRecord, _index: number, base: SectionBase<'label-values-section'>, sectionContext: ParseContext): LabelValuesSection;
}

declare class ExperienceSectionParser extends BaseSectionParser<'experience-section', ExperienceSection> {
    readonly type = "experience-section";
    protected parseContent(section: UnknownRecord, _index: number, base: SectionBase<'experience-section'>, sectionContext: ParseContext): ExperienceSection;
}

declare class EducationSectionParser extends BaseSectionParser<'education-section', EducationSection> {
    readonly type = "education-section";
    protected parseContent(section: UnknownRecord, _index: number, base: SectionBase<'education-section'>, sectionContext: ParseContext): EducationSection;
}

declare class ProjectsSectionParser extends BaseSectionParser<'projects-section', ProjectsSection> {
    readonly type = "projects-section";
    protected parseContent(section: UnknownRecord, _index: number, base: SectionBase<'projects-section'>, sectionContext: ParseContext): ProjectsSection;
}

declare class CertificationsSectionParser extends BaseSectionParser<'certifications-section', CertificationsSection> {
    readonly type = "certifications-section";
    protected parseContent(section: UnknownRecord, _index: number, base: SectionBase<'certifications-section'>, sectionContext: ParseContext): CertificationsSection;
}

declare class InterestsSectionParser extends BaseSectionParser<'interests-section', InterestsSection> {
    readonly type = "interests-section";
    protected parseContent(section: UnknownRecord, _index: number, base: SectionBase<'interests-section'>, sectionContext: ParseContext): InterestsSection;
}

declare class LabelValue1SectionParser extends BaseSectionParser<'label-value1-section', LabelValue1Section> {
    readonly type = "label-value1-section";
    protected parseContent(section: UnknownRecord, _index: number, base: SectionBase<'label-value1-section'>, sectionContext: ParseContext): LabelValue1Section;
}

declare class LabelValue2SectionParser extends BaseSectionParser<'label-value2-section', LabelValue2Section> {
    readonly type = "label-value2-section";
    protected parseContent(section: UnknownRecord, _index: number, base: SectionBase<'label-value2-section'>, sectionContext: ParseContext): LabelValue2Section;
}

declare class CVDocumentParserFacade {
    private readonly sectionParser;
    private readonly normalizer;
    private readonly logger;
    constructor(sectionParser: CVDocumentParser, normalizer: AuthoringInputNormalizer, logger: AppLogger);
    parse(input: unknown): CVDocument;
    private isCanonicalDocument;
    private extractErrorMessage;
}

type CVContentFormat = 'json' | 'yaml' | 'toml';
declare const SUPPORTED_CONTENT_FORMATS: readonly CVContentFormat[];

interface CVContentDeserializer {
    readonly format: CVContentFormat;
    deserialize(content: string): unknown;
}

declare class CVContentDeserializerFactory {
    private readonly deserializerRegistry;
    constructor(deserializers: CVContentDeserializer[]);
    static createDefault(): CVContentDeserializerFactory;
    getDeserializer(format: CVContentFormat): CVContentDeserializer;
}

declare class CVContentFormatResolver {
    static resolveFromFilePath(filePath: string): CVContentFormat;
    static resolveFromContentType(contentType: string): CVContentFormat;
}

declare class JsonContentDeserializer implements CVContentDeserializer {
    readonly format: "json";
    deserialize(content: string): unknown;
}

declare class YamlContentDeserializer implements CVContentDeserializer {
    readonly format: "yaml";
    deserialize(content: string): unknown;
}

declare class TomlContentDeserializer implements CVContentDeserializer {
    readonly format: "toml";
    deserialize(content: string): unknown;
}

declare class CVDocumentContentParserFacade {
    private readonly deserializerFactory;
    private readonly documentParser;
    private readonly logger;
    constructor(deserializerFactory: CVContentDeserializerFactory, documentParser: CVDocumentParserFacade, logger: AppLogger);
    parse(content: string, format: CVContentFormat): CVDocument;
    parseByFilePath(content: string, filePath: string): CVDocument;
    parseByContentType(content: string, contentType: string): CVDocument;
    private extractErrorMessage;
}

interface CVProcessorCradle {
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
declare function createCVProcessorContainer(): AwilixContainer<CVProcessorCradle>;

export { type AppLogger, AuthoringInputNormalizer, type AuthoringProfile, AuthoringProfileRegistry, BaseSectionParser, type CVContentDeserializer, CVContentDeserializerFactory, type CVContentFormat, CVContentFormatResolver, type CVDocument, CVDocumentBuilder, CVDocumentContentParserFacade, CVDocumentParser, CVDocumentParserFacade, type CVProcessorCradle, type CVSection, type CertificationEntry, type CertificationsSection, CertificationsSectionParser, type Duration, type EducationEntry, type EducationSection, EducationSectionParser, type EductionSection, type ExperienceEntry, type ExperienceSection, ExperienceSectionParser, type ISection, type InterestsSection, InterestsSectionParser, JsonContentDeserializer, JsonValueReader, type LabelValue1, type LabelValue1Section, LabelValue1SectionParser, type LabelValue2, type LabelValue2Section, LabelValue2SectionParser, type LabelValues, type LabelValuesSection, LabelValuesSectionParser, type LoggerDecorator, LoggerFactory, type LoggerMetadata, NodeDecorator, ParseContext, type Personal, type PersonalSection, PersonalSectionParser, PinoLoggerAdapter, type ProjectEntry, type ProjectsSection, ProjectsSectionParser, SECTION_TYPES, SINGLE_INSTANCE_SECTION_TYPES, SUPPORTED_CONTENT_FORMATS, type SectionBase, type SectionCaption, type SectionParser, SectionParserFactory, type SectionType, SectionValueParser, type SocialEntry, TestDecorator, type TextDirection, TomlContentDeserializer, type UnknownRecord, ValidationRules, type ValueSection, ValueSectionParser, WebDecorator, YamlContentDeserializer, createCVProcessorContainer, englishProfile, urduProfile };
