import { InvalidSymbolError } from "../errors/InvalidSymbolError";

export class Symbol {
  private readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  static create(value: string): Symbol {
    const normalized = value.toUpperCase().trim();

    if (!Symbol.isValid(normalized)) {
      throw new InvalidSymbolError(value);
    }

    return new Symbol(normalized);
  }

  static isValid(value: string): boolean {
    // Stock symbols: 1-5 uppercase letters, optionally followed by a dot and more letters
    const symbolRegex = /^[A-Z]{1,5}(\.[A-Z]{1,2})?$/;
    return symbolRegex.test(value);
  }

  toString(): string {
    return this.value;
  }

  equals(other: Symbol): boolean {
    return this.value === other.value;
  }

  toJSON(): string {
    return this.value;
  }
}
