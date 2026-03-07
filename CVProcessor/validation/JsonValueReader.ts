import type { SectionType } from "@/CVProcessor/domain";
import { ParseContext } from "./ParseContext";
import { ValidationRules } from "./ValidationRules";

export type UnknownRecord = Record<string, unknown>;

export class JsonValueReader {
  static readRecord(value: unknown, context: ParseContext): UnknownRecord {
    if (!this.isRecord(value)) {
      throw new Error(`${context} must be an object.`);
    }

    return value;
  }

  static readRecordArray(value: unknown, context: ParseContext): UnknownRecord[] {
    if (!Array.isArray(value)) {
      throw new Error(`${context} must be an array of objects.`);
    }

    return value.map((entry, index) => this.readRecord(entry, context.index(index)));
  }

  static readString(value: unknown, context: ParseContext): string {
    if (!ValidationRules.isNonEmptyString(value)) {
      throw new Error(`${context} must be a non-empty string.`);
    }

    return value;
  }

  static readStringArray(value: unknown, context: ParseContext): string[] {
    if (!Array.isArray(value)) {
      throw new Error(`${context} must be an array of strings.`);
    }

    return value.map((entry, index) => this.readString(entry, context.index(index)));
  }

  static readSectionType(value: unknown, context: ParseContext): SectionType {
    if (!ValidationRules.isSectionType(value)) {
      throw new Error(`${context} is invalid.`);
    }

    return value;
  }

  private static isRecord(value: unknown): value is UnknownRecord {
    return typeof value === "object" && value !== null && !Array.isArray(value);
  }
}
