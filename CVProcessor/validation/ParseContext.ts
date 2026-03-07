export class ParseContext {
  private constructor(private readonly path: string) {}

  static root(): ParseContext {
    return new ParseContext("document");
  }

  field(name: string): ParseContext {
    return new ParseContext(`${this.path}.${name}`);
  }

  index(position: number): ParseContext {
    return new ParseContext(`${this.path}[${position}]`);
  }

  toString(): string {
    return this.path;
  }
}
